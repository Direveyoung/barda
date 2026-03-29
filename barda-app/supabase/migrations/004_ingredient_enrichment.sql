-- ============================================================
-- BARDA Phase 4: 성분 규제/제품 확장 필드
-- Run AFTER 003_user_data_persistence.sql
-- ============================================================

-- ── ingredients 테이블 확장 ──

alter table ingredients add column if not exists regulation_status text;
alter table ingredients add column if not exists max_concentration text;
alter table ingredients add column if not exists regulation_notes text;
alter table ingredients add column if not exists regulation_source text;
alter table ingredients add column if not exists regulation_updated_at timestamptz;
alter table ingredients add column if not exists cas_no text;

-- ── products 테이블 확장 ──

alter table products add column if not exists full_ingredients_text text;
alter table products add column if not exists routine_step integer;
alter table products add column if not exists routine_timing text check (routine_timing in ('am', 'pm', 'both'));
alter table products add column if not exists routine_frequency text check (routine_frequency in ('daily', 'alternate', 'weekly'));
alter table products add column if not exists usage_notes text;
