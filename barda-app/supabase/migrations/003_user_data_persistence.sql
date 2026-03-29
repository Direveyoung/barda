-- ============================================================
-- BARDA Phase 3: 유저 데이터 영속화 + 성분 민감도
-- Run AFTER 002_product_db_schema.sql
-- ============================================================

-- ──────────────────────────────────────────────
-- 1. user_profiles: 프로필 (localStorage → DB)
-- ──────────────────────────────────────────────

create table if not exists user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default '',
  skin_type text,
  concerns text[] default '{}',
  avatar_url text,
  kakao_nickname text,
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- 2. user_skin_diary: 피부 일기
-- ──────────────────────────────────────────────

create table if not exists user_skin_diary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  condition text not null check (condition in ('good', 'normal', 'meh', 'bad', 'terrible')),
  memo text default '',
  weather_snapshot jsonb,
  created_at timestamptz default now(),
  unique(user_id, date)
);

create index if not exists idx_diary_user_date on user_skin_diary(user_id, date desc);

-- ──────────────────────────────────────────────
-- 3. user_checklist_logs: 일일 체크리스트
-- ──────────────────────────────────────────────

create table if not exists user_checklist_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  am_checks boolean[] default '{}',
  pm_checks boolean[] default '{}',
  created_at timestamptz default now(),
  unique(user_id, date)
);

create index if not exists idx_checks_user_date on user_checklist_logs(user_id, date desc);

-- ──────────────────────────────────────────────
-- 4. user_drawer_items: 서랍장
-- ──────────────────────────────────────────────

create table if not exists user_drawer_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id text not null,
  brand text not null,
  name text not null,
  category_id text not null,
  opened_date date,
  status text default 'unopened' check (status in ('unopened', 'using', 'finished')),
  added_at timestamptz default now(),
  unique(user_id, product_id)
);

create index if not exists idx_drawer_user on user_drawer_items(user_id);

-- ──────────────────────────────────────────────
-- 5. user_challenges: 7일 챌린지
-- ──────────────────────────────────────────────

create table if not exists user_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  start_date date not null,
  completed_days boolean[] default '{false,false,false,false,false,false,false}',
  diary_entries jsonb default '[]',
  is_complete boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_challenge_user on user_challenges(user_id, created_at desc);

-- ──────────────────────────────────────────────
-- 6. user_ingredient_sensitivities: 성분 민감도
-- ──────────────────────────────────────────────

create table if not exists user_ingredient_sensitivities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  ingredient_name text not null,
  severity text default 'mild' check (severity in ('mild', 'moderate', 'severe')),
  reaction_note text,
  reported_at timestamptz default now(),
  unique(user_id, ingredient_name)
);

create index if not exists idx_sensitivity_user on user_ingredient_sensitivities(user_id);

-- ──────────────────────────────────────────────
-- 7. user_product_feedback: 제품 피드백/리뷰
-- ──────────────────────────────────────────────

create table if not exists user_product_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id text not null,
  rating integer check (rating between 1 and 5),
  review text,
  repurchase boolean,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

create index if not exists idx_feedback_user on user_product_feedback(user_id);

-- ──────────────────────────────────────────────
-- RLS 정책
-- ──────────────────────────────────────────────

alter table user_profiles enable row level security;
alter table user_skin_diary enable row level security;
alter table user_checklist_logs enable row level security;
alter table user_drawer_items enable row level security;
alter table user_challenges enable row level security;
alter table user_ingredient_sensitivities enable row level security;
alter table user_product_feedback enable row level security;

-- 본인 데이터만 CRUD
create policy "Users manage own profile" on user_profiles
  for all using (auth.uid() = user_id);

create policy "Users manage own diary" on user_skin_diary
  for all using (auth.uid() = user_id);

create policy "Users manage own checklists" on user_checklist_logs
  for all using (auth.uid() = user_id);

create policy "Users manage own drawer" on user_drawer_items
  for all using (auth.uid() = user_id);

create policy "Users manage own challenges" on user_challenges
  for all using (auth.uid() = user_id);

create policy "Users manage own sensitivities" on user_ingredient_sensitivities
  for all using (auth.uid() = user_id);

create policy "Users manage own feedback" on user_product_feedback
  for all using (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- updated_at 트리거
-- ──────────────────────────────────────────────

create trigger user_profiles_updated_at before update on user_profiles
  for each row execute function set_updated_at();
