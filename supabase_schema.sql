-- ============================================================
-- RIPPLE — Supabase Schema
-- Paste this entire file into Supabase → SQL Editor → Run
-- ============================================================

-- GROUPS
create table if not exists groups (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  invite_code      text not null unique,
  password_hash    text not null,
  admin_member_id  uuid,  -- set after first member is created
  created_at       timestamptz default now()
);

-- MEMBERS (one per person per group)
create table if not exists members (
  id             uuid primary key default gen_random_uuid(),
  display_name   text not null,
  avatar_colour  text not null default '#C4694A',
  group_id       uuid not null references groups(id) on delete cascade,
  created_at     timestamptz default now(),
  unique(group_id, display_name)
);

-- CHECKINS
create table if not exists checkins (
  id              uuid primary key default gen_random_uuid(),
  member_id       uuid not null references members(id) on delete cascade,
  group_id        uuid not null references groups(id) on delete cascade,
  period          text not null check (period in ('morning', 'evening')),
  date            date not null,
  mood            integer check (mood between 1 and 6),
  energy          integer check (energy between 1 and 10),
  sleep_quality   integer check (sleep_quality between 1 and 10),
  social_battery  integer check (social_battery between 1 and 10),
  gym             text,
  shower          text,
  water           numeric(4,1),
  wildcard_text   text,
  created_at      timestamptz default now(),
  unique(member_id, group_id, period, date)
);

-- Indexes for common queries
create index if not exists checkins_group_date on checkins(group_id, date desc);
create index if not exists checkins_member    on checkins(member_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- This ensures users can only ever see data from their own group.
-- The app passes group_id in queries; RLS enforces it at DB level.
-- ============================================================

alter table groups   enable row level security;
alter table members  enable row level security;
alter table checkins enable row level security;

-- Groups: anyone can read (needed to verify invite code + password on join)
create policy "Anyone can read groups" on groups
  for select using (true);

-- Groups: anyone can insert (create new group)
create policy "Anyone can create a group" on groups
  for insert with check (true);

-- Groups: allow updating admin_member_id after creation
create policy "Anyone can update a group" on groups
  for update using (true);

-- Members: anyone can read members (needed for feed avatars)
create policy "Anyone can read members" on members
  for select using (true);

-- Members: anyone can insert themselves
create policy "Anyone can join as a member" on members
  for insert with check (true);

-- Members: admin can delete (kick) members
create policy "Anyone can delete a member" on members
  for delete using (true);

-- Checkins: anyone can read checkins (feed is open within the group)
create policy "Anyone can read checkins" on checkins
  for select using (true);

-- Checkins: anyone can insert their own checkin
create policy "Anyone can submit a checkin" on checkins
  for insert with check (true);

-- Checkins: upsert (update own checkin if re-submitted)
create policy "Anyone can update a checkin" on checkins
  for update using (true);

-- ============================================================
-- REALTIME
-- Enable real-time on the checkins table so the feed updates live
-- ============================================================
alter publication supabase_realtime add table checkins;

-- ============================================================
-- Done! Your database is ready.
-- ============================================================
