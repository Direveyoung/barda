-- ============================================================
-- BARDA MVP-2 Database Schema
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. user_routines: 분석 결과 저장
create table if not exists user_routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  skin_type text not null,
  concerns text[] not null default '{}',
  products jsonb not null,
  analysis_result jsonb not null,
  score int,
  category_signature text[],
  active_signature text[],
  is_paid boolean default false,
  created_at timestamptz default now()
);

-- 2. payments: 토스페이먼츠 결제 기록
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  routine_id uuid references user_routines(id) on delete set null,
  payment_key text unique not null,
  order_id text unique not null,
  amount int not null,
  status text not null default 'pending',
  raw_response jsonb,
  provider text default 'toss',
  created_at timestamptz default now()
);

-- 3. search_logs: 검색 쿼리 로그
create table if not exists search_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  query text not null,
  results_count int not null default 0,
  selected_product_id text,
  created_at timestamptz default now()
);

-- 4. product_candidates: 유저가 제출한 미등록 제품
create table if not exists product_candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  brand text not null,
  name text not null,
  category_guess text,
  submit_count int default 1,
  status text default 'pending',
  created_at timestamptz default now()
);

-- 5. funnel_events: 퍼널 이벤트 트래킹
create table if not exists funnel_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  session_id text not null,
  event_name text not null,
  event_data jsonb default '{}',
  created_at timestamptz default now()
);

-- 6. report_feedback: 분석 결과 피드백
create table if not exists report_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  routine_id uuid references user_routines(id) on delete cascade,
  conflict_rule_id text,
  is_helpful boolean not null,
  session_id text,
  created_at timestamptz default now()
);

-- 7. routine_posts: 커뮤니티 루틴 공유
create table if not exists routine_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  routine_id uuid references user_routines(id) on delete cascade,
  skin_type text not null,
  concerns text[] not null default '{}',
  products_json jsonb not null,
  score int not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  like_count int default 0,
  comment_count int default 0,
  created_at timestamptz default now()
);

-- 8. routine_post_likes: 좋아요
create table if not exists routine_post_likes (
  user_id uuid references auth.users(id) on delete cascade not null,
  post_id uuid references routine_posts(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- 9. routine_post_comments: 댓글
create table if not exists routine_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references routine_posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table user_routines enable row level security;
alter table payments enable row level security;
alter table search_logs enable row level security;
alter table product_candidates enable row level security;
alter table funnel_events enable row level security;
alter table report_feedback enable row level security;
alter table routine_posts enable row level security;
alter table routine_post_likes enable row level security;
alter table routine_post_comments enable row level security;

-- user_routines: 본인만 조회/생성
create policy "Users read own routines" on user_routines
  for select using (auth.uid() = user_id);
create policy "Users create own routines" on user_routines
  for insert with check (auth.uid() = user_id);
create policy "Users update own routines" on user_routines
  for update using (auth.uid() = user_id);

-- payments: 본인만 조회
create policy "Users read own payments" on payments
  for select using (auth.uid() = user_id);
create policy "Service inserts payments" on payments
  for insert with check (true);

-- search_logs: 누구나 삽입 가능 (비로그인 포함)
create policy "Anyone can insert search logs" on search_logs
  for insert with check (true);
create policy "Users read own search logs" on search_logs
  for select using (auth.uid() = user_id);

-- product_candidates: 누구나 삽입
create policy "Anyone can submit candidates" on product_candidates
  for insert with check (true);

-- funnel_events: 누구나 삽입
create policy "Anyone can insert events" on funnel_events
  for insert with check (true);

-- report_feedback: 누구나 삽입
create policy "Anyone can submit feedback" on report_feedback
  for insert with check (true);

-- routine_posts: 누구나 조회, 본인만 생성/삭제
create policy "Anyone can view posts" on routine_posts
  for select using (true);
create policy "Users create own posts" on routine_posts
  for insert with check (auth.uid() = user_id);
create policy "Users delete own posts" on routine_posts
  for delete using (auth.uid() = user_id);

-- routine_post_likes: 본인 좋아요만 관리
create policy "Users manage own likes" on routine_post_likes
  for all using (auth.uid() = user_id);

-- routine_post_comments: 누구나 조회, 본인만 생성
create policy "Anyone can view comments" on routine_post_comments
  for select using (true);
create policy "Users create own comments" on routine_post_comments
  for insert with check (auth.uid() = user_id);
create policy "Users delete own comments" on routine_post_comments
  for delete using (auth.uid() = user_id);

-- ============================================================
-- Indexes
-- ============================================================

create index if not exists idx_routine_posts_skin_type on routine_posts(skin_type);
create index if not exists idx_routine_posts_created on routine_posts(created_at desc);
create index if not exists idx_search_logs_query on search_logs(query);
create index if not exists idx_funnel_events_name on funnel_events(event_name);
create index if not exists idx_user_routines_user on user_routines(user_id, created_at desc);

-- ============================================================
-- Function: 좋아요 카운트 동기화
-- ============================================================

create or replace function update_post_like_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update routine_posts set like_count = like_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update routine_posts set like_count = like_count - 1 where id = OLD.post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create or replace trigger on_like_change
  after insert or delete on routine_post_likes
  for each row execute function update_post_like_count();

-- 댓글 카운트 동기화
create or replace function update_post_comment_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update routine_posts set comment_count = comment_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update routine_posts set comment_count = comment_count - 1 where id = OLD.post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create or replace trigger on_comment_change
  after insert or delete on routine_post_comments
  for each row execute function update_post_comment_count();
