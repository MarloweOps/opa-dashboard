create extension if not exists pgcrypto;

create table if not exists approval_queue (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  title text not null,
  description text,
  risk_level text default 'low',
  context text,
  status text default 'pending',
  resolved_at timestamptz,
  category text
);

create table if not exists marlowe_tasks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  title text not null,
  description text,
  category text,
  status text default 'queued',
  priority text default 'med',
  blocker text,
  session_id text
);

create table if not exists active_agents (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text not null,
  role text,
  task text,
  status text default 'active',
  session_id text,
  started_at timestamptz default now()
);

create table if not exists brief_archive (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  brief_date date not null,
  content text not null,
  weather_line text,
  top_pick text
);

create table if not exists outreach_contacts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text not null,
  company text,
  platform text,
  status text default 'not_started',
  last_contact timestamptz,
  notes text
);

create table if not exists ops_today (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  task text not null,
  priority text default 'backlog',
  category text,
  done boolean default false,
  sort_order int default 0
);

insert into marlowe_tasks (title, status, priority, category)
select 'Build Production Master v1.4', 'active', 'high', 'TEMPLATE'
where not exists (select 1 from marlowe_tasks where title = 'Build Production Master v1.4');

insert into marlowe_tasks (title, status, blocker, category)
select 'Fix Resend API key', 'blocked', 'Brendan generates new key at app.resend.com/EMAIL', 'EMAIL'
where not exists (select 1 from marlowe_tasks where title = 'Fix Resend API key');

insert into marlowe_tasks (title, status, category)
select 'Patch OPA-SYSTEM-BRIEF.md', 'queued', 'OPA'
where not exists (select 1 from marlowe_tasks where title = 'Patch OPA-SYSTEM-BRIEF.md');

insert into marlowe_tasks (title, status, category)
select 'Wire update-status.sh to Supabase', 'queued', 'INFRA'
where not exists (select 1 from marlowe_tasks where title = 'Wire update-status.sh to Supabase');

insert into marlowe_tasks (title, status, category)
select 'Save Heywood Articles 1+2', 'queued', 'CONTENT'
where not exists (select 1 from marlowe_tasks where title = 'Save Heywood Articles 1+2');

insert into marlowe_tasks (title, status, category)
select 'Lemon Squeezy setup', 'queued', 'TEMPLATE'
where not exists (select 1 from marlowe_tasks where title = 'Lemon Squeezy setup');

insert into marlowe_tasks (title, status, category)
select 'Outreach target list', 'queued', 'OPA'
where not exists (select 1 from marlowe_tasks where title = 'Outreach target list');

insert into approval_queue (title, description, risk_level, context, status, category)
select
  'Run email drip to 6 trial users',
  'Send Day 3/14/25 emails via Resend to real trial users. Waiting on valid Resend API key.',
  'med',
  'Send Day 3/14/25 emails via Resend to real trial users. Waiting on valid Resend API key.',
  'pending',
  'EMAIL'
where not exists (select 1 from approval_queue where title = 'Run email drip to 6 trial users' and status = 'pending');

insert into ops_today (task, priority, category, done, sort_order)
select * from (
  values
    ('Finalize Production Master v1.4 pricing', 'priority', 'TEMPLATE', false, 1),
    ('Validate Resend key and run drip test', 'priority', 'EMAIL', false, 2),
    ('Write outreach opening scripts', 'backlog', 'OPA', false, 3),
    ('Review yesterday brief for market signal', 'done', 'OPA', true, 4)
) as seed(task, priority, category, done, sort_order)
where not exists (select 1 from ops_today);

insert into brief_archive (brief_date, content, weather_line, top_pick)
select * from (
  values
    (current_date, 'Risk low. Leverage high if pricing page ships by noon. Prioritize drip unblock.', 'Cool morning, clear afternoon.', 'NVDA'),
    (current_date - interval '1 day', 'Stripe checks stable. Focus on outreach pipeline and template close.', 'Overcast early, sun later.', 'MSFT')
) as seed(brief_date, content, weather_line, top_pick)
where not exists (select 1 from brief_archive);

insert into outreach_contacts (name, company, platform, status, notes)
select * from (
  values
    ('Ari Cole', 'F45 Midtown', 'LinkedIn', 'not_started', 'Prior coordinator lead from January list.'),
    ('Nora Patel', 'F45 Pacific', 'Email', 'messaged', 'Sent intro + template preview.')
) as seed(name, company, platform, status, notes)
where not exists (select 1 from outreach_contacts);
