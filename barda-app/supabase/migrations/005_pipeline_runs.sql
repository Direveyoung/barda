-- 005: Pipeline run history + admin weekly reports
-- Stores automated pipeline execution results for monitoring.

create table if not exists pipeline_runs (
  id uuid default gen_random_uuid() primary key,
  run_type text not null,                          -- 'auto_promote' | 'search_miss' | 'weekly_report' | 'community_analysis'
  results jsonb not null default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_pipeline_runs_type on pipeline_runs(run_type);
create index if not exists idx_pipeline_runs_created on pipeline_runs(created_at desc);

-- RLS: only service role can access (Edge Functions use service role key)
alter table pipeline_runs enable row level security;
