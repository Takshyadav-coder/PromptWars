-- Supabase Migration: Init LeetQuest Schema
-- Enable required extensions
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text default 'Asia/Kolkata' not null,
  xp int default 0 not null,
  level int default 1 not null,
  current_streak int default 0 not null,
  longest_streak int default 0 not null,
  last_active_date date,
  leaderboard_opt_in boolean default false not null,
  created_at timestamptz default now() not null
);

-- 2. PROBLEMS TABLE
create table if not exists public.problems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  topic text not null check (topic in (
    'Arrays', 'Strings', 'Linked Lists', 'Stacks', 'Queues', 'Trees',
    'Graphs', 'Binary Search', 'Recursion', 'Backtracking', 'Greedy', 'DP'
  )),
  url text,
  solved_date date not null,
  notes text,
  created_at timestamptz default now() not null
);

-- Case-insensitive unique constraint per user
create unique index if not exists idx_problems_user_lower_title 
  on public.problems (user_id, lower(title));

-- 3. MISSIONS TABLE
create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_key text not null,
  title text not null,
  description text not null,
  topic text not null,
  target_count int not null check (target_count > 0),
  xp_reward int not null check (xp_reward >= 0),
  status text not null check (status in ('active', 'completed')) default 'active',
  created_at timestamptz default now() not null,
  completed_at timestamptz
);

-- 4. XP_EVENTS TABLE (UNIQUE on mission_id guarantees exactly-once reward)
create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id uuid unique not null references public.missions(id) on delete cascade,
  xp int not null check (xp >= 0),
  created_at timestamptz default now() not null
);

-- 5. BADGES TABLE
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  earned_at timestamptz default now() not null,
  unique (user_id, key)
);

-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
alter table public.profiles enable row level security;
alter table public.problems enable row level security;
alter table public.missions enable row level security;
alter table public.xp_events enable row level security;
alter table public.badges enable row level security;

-- PROFILES RLS
create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can view leaderboard profiles"
  on public.profiles for select
  using (leaderboard_opt_in = true);

create policy "Users can update non-XP profile fields" 
  on public.profiles for update 
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- PROBLEMS RLS
create policy "Users can select own problems" 
  on public.problems for select 
  using (auth.uid() = user_id);

create policy "Users can insert own problems" 
  on public.problems for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own problems" 
  on public.problems for update 
  using (auth.uid() = user_id);

create policy "Users can delete own problems" 
  on public.problems for delete 
  using (auth.uid() = user_id);

-- MISSIONS RLS (reads only for users, writes via server / complete_mission)
create policy "Users can select own missions" 
  on public.missions for select 
  using (auth.uid() = user_id);

-- XP_EVENTS RLS (reads only for users, writes via server / complete_mission)
create policy "Users can select own xp events" 
  on public.xp_events for select 
  using (auth.uid() = user_id);

-- BADGES RLS
create policy "Users can select own badges" 
  on public.badges for select 
  using (auth.uid() = user_id);

-- TRIGGER: Auto-create profile row on auth.users insert
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, timezone, xp, level, current_streak, longest_streak)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'timezone', 'Asia/Kolkata'),
    0,
    1,
    0,
    0
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- FUNCTION: complete_mission(mission_id, user_id)
-- Atomically inserts xp_event (ON CONFLICT DO NOTHING), and only if inserted, updates profile and marks mission completed.
create or replace function public.complete_mission(p_mission_id uuid, p_user_id uuid)
returns json as $$
declare
  v_mission public.missions%rowtype;
  v_profile public.profiles%rowtype;
  v_xp_inserted boolean := false;
  v_new_xp int;
  v_new_level int;
  v_user_tz text;
  v_current_date date;
  v_new_streak int;
  v_longest_streak int;
begin
  -- Fetch active mission for the user
  select * into v_mission
  from public.missions
  where id = p_mission_id and user_id = p_user_id;

  if not found then
    return json_build_object('success', false, 'reason', 'Mission not found or not owned by user');
  end if;

  if v_mission.status = 'completed' then
    return json_build_object('success', false, 'reason', 'Mission already completed', 'xpAwarded', 0);
  end if;

  -- Fetch user profile
  select * into v_profile
  from public.profiles
  where id = p_user_id for update;

  if not found then
    return json_build_object('success', false, 'reason', 'Profile not found');
  end if;

  -- Attempt atomic insert into xp_events
  insert into public.xp_events (user_id, mission_id, xp)
  values (p_user_id, p_mission_id, v_mission.xp_reward)
  on conflict (mission_id) do nothing;

  if not found then
    -- Conflict hit! Already awarded.
    return json_build_object('success', false, 'reason', 'XP already awarded for this mission', 'xpAwarded', 0);
  end if;

  -- If we reached here, xp_event was newly inserted!
  v_user_tz := coalesce(v_profile.timezone, 'Asia/Kolkata');
  v_current_date := (now() at time zone v_user_tz)::date;

  -- Streak calculation
  if v_profile.last_active_date is null then
    v_new_streak := 1;
  elsif v_profile.last_active_date = v_current_date then
    v_new_streak := v_profile.current_streak;
  elsif v_profile.last_active_date = v_current_date - interval '1 day' then
    v_new_streak := v_profile.current_streak + 1;
  else
    v_new_streak := 1;
  end if;

  v_longest_streak := greatest(v_profile.longest_streak, v_new_streak);
  v_new_xp := v_profile.xp + v_mission.xp_reward;
  v_new_level := floor(sqrt(v_new_xp / 100)) + 1;

  -- Update profile
  update public.profiles
  set
    xp = v_new_xp,
    level = v_new_level,
    current_streak = v_new_streak,
    longest_streak = v_longest_streak,
    last_active_date = v_current_date
  where id = p_user_id;

  -- Update mission status
  update public.missions
  set
    status = 'completed',
    completed_at = now()
  where id = p_mission_id;

  return json_build_object(
    'success', true,
    'xpAwarded', v_mission.xp_reward,
    'newXp', v_new_xp,
    'newLevel', v_new_level,
    'currentStreak', v_new_streak,
    'longestStreak', v_longest_streak
  );
end;
$$ language plpgsql security definer;
