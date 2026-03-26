-- ============================================================
-- BARDA Phase 2: 제품/성분 DB + 기존 스키마 불일치 수정
-- Run AFTER 001_initial_schema.sql in Supabase SQL Editor
-- ============================================================

-- ──────────────────────────────────────────────
-- A. 신규 테이블: brands, products, ingredients,
--    product_ingredients, ingredient_interactions
-- ──────────────────────────────────────────────

-- 1. brands: 브랜드 마스터
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name_ko text not null unique,
  name_en text,
  country text default '한국',
  price_tier text check (price_tier in ('budget', 'midrange', 'premium', 'luxury')),
  aliases text[] default '{}',
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_brands_name_ko on brands(name_ko);

-- 2. products: 제품 마스터 (773개 시드 예정)
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,                          -- 기존 인메모리 id 매핑
  brand_id uuid references brands(id) on delete set null,
  brand_name text not null,                       -- 비정규화 (검색 성능)
  name text not null,
  category_id text not null,
  volume_ml integer,
  price integer,
  active_flags text[] default '{}',
  concentration_level text check (concentration_level in ('low', 'medium', 'high')),
  key_ingredients text[] default '{}',
  tags text[] default '{}',
  source text not null default 'seed_v1',
  verified boolean default false,
  barcode text,
  slug text unique,
  description text,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_products_brand_id on products(brand_id);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_brand_name on products(brand_name);
create index if not exists idx_products_name on products using gin (to_tsvector('simple', name));
create index if not exists idx_products_barcode on products(barcode) where barcode is not null;
create index if not exists idx_products_tags on products using gin (tags);
create index if not exists idx_products_active_flags on products using gin (active_flags);

-- 3. ingredients: 성분 마스터 (40+ 시드 예정)
create table if not exists ingredients (
  id uuid primary key default gen_random_uuid(),
  name_ko text not null unique,
  name_en text,
  inci_name text,
  category text not null,                         -- moisturizing, brightening, etc.
  safety_score integer check (safety_score between 1 and 5),
  ewg_score integer check (ewg_score between 1 and 10),
  efficacy text,
  caution text,
  skin_types text[] default '{}',
  is_active boolean default false,
  is_fragrance boolean default false,
  is_preservative boolean default false,
  aliases text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_ingredients_name_ko on ingredients(name_ko);
create index if not exists idx_ingredients_category on ingredients(category);

-- 4. ingredient_interactions: 성분 시너지/충돌 (goodWith/avoidWith 대체)
create table if not exists ingredient_interactions (
  id uuid primary key default gen_random_uuid(),
  ingredient_a_id uuid references ingredients(id) on delete cascade not null,
  ingredient_b_id uuid references ingredients(id) on delete cascade not null,
  interaction_type text not null check (interaction_type in ('synergy', 'conflict', 'caution')),
  description text,
  unique(ingredient_a_id, ingredient_b_id)
);

create index if not exists idx_interactions_a on ingredient_interactions(ingredient_a_id);
create index if not exists idx_interactions_b on ingredient_interactions(ingredient_b_id);

-- 5. product_ingredients: 제품↔성분 매핑 (핵심 가치 테이블)
create table if not exists product_ingredients (
  product_id uuid references products(id) on delete cascade not null,
  ingredient_id uuid references ingredients(id) on delete cascade not null,
  is_key boolean default false,
  percentage numeric,
  rank integer,                                   -- 전성분표 순서
  primary key (product_id, ingredient_id)
);

create index if not exists idx_pi_product on product_ingredients(product_id);
create index if not exists idx_pi_ingredient on product_ingredients(ingredient_id);

-- ──────────────────────────────────────────────
-- B. 기존 테이블 스키마 불일치 수정
--    (코드가 사용하는 컬럼명과 001 스키마 맞추기)
-- ──────────────────────────────────────────────

-- B-1. routine_posts: products → products_json, satisfaction → rating
alter table routine_posts rename column products to products_json;
alter table routine_posts rename column satisfaction to rating;

-- B-2. payments: toss_response → raw_response, add provider
alter table payments rename column toss_response to raw_response;
alter table payments add column if not exists provider text default 'toss';

-- B-3. report_feedback: target_type/target_id/is_positive → conflict_rule_id/is_helpful/session_id
alter table report_feedback drop column if exists target_type;
alter table report_feedback drop column if exists target_id;
alter table report_feedback rename column is_positive to is_helpful;
alter table report_feedback add column if not exists conflict_rule_id text;
alter table report_feedback add column if not exists session_id text;

-- ──────────────────────────────────────────────
-- C. RLS 정책 (신규 테이블)
-- ──────────────────────────────────────────────

alter table brands enable row level security;
alter table products enable row level security;
alter table ingredients enable row level security;
alter table ingredient_interactions enable row level security;
alter table product_ingredients enable row level security;

-- brands/products/ingredients: 모두 읽기 가능 (공개 데이터)
create policy "Anyone can read brands" on brands for select using (true);
create policy "Anyone can read products" on products for select using (true);
create policy "Anyone can read ingredients" on ingredients for select using (true);
create policy "Anyone can read interactions" on ingredient_interactions for select using (true);
create policy "Anyone can read product_ingredients" on product_ingredients for select using (true);

-- 쓰기는 service_role만 (시드/관리자)
-- Supabase service_role은 RLS를 우회하므로 별도 정책 불필요

-- ──────────────────────────────────────────────
-- D. updated_at 자동 갱신 트리거
-- ──────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger brands_updated_at before update on brands
  for each row execute function set_updated_at();

create trigger products_updated_at before update on products
  for each row execute function set_updated_at();

create trigger ingredients_updated_at before update on ingredients
  for each row execute function set_updated_at();
