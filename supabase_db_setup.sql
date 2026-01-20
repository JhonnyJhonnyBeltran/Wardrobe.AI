-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  updated_at timestamp with time zone,
  constraint username_length check (char_length(username) >= 3)
);

-- Profiles Schema Updates (Idempotent)
alter table public.profiles add column if not exists gender text;
alter table public.profiles add column if not exists age_range text;
alter table public.profiles add column if not exists height numeric;
alter table public.profiles add column if not exists height_range text;
alter table public.profiles add column if not exists preferred_styles text[];
alter table public.profiles add column if not exists uses_accessories boolean;
alter table public.profiles add column if not exists visual_style_preferences text[];
alter table public.profiles add column if not exists style_completed boolean default false;


-- 2. CLOTHING ITEMS
create table if not exists public.clothing_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Clothing Items Schema Updates (Idempotent)
alter table public.clothing_items add column if not exists color text;
alter table public.clothing_items add column if not exists color_hex text;
alter table public.clothing_items add column if not exists image_url text;
alter table public.clothing_items add column if not exists original_image_url text;
alter table public.clothing_items add column if not exists brand text;
alter table public.clothing_items add column if not exists size text;
alter table public.clothing_items add column if not exists fabric text;
alter table public.clothing_items add column if not exists reference text;
alter table public.clothing_items add column if not exists source_url text;
alter table public.clothing_items add column if not exists season text[];
alter table public.clothing_items add column if not exists tags text[];
alter table public.clothing_items add column if not exists favorite boolean default false;
alter table public.clothing_items add column if not exists is_ai_processed boolean default false;


-- 3. OUTFITS
create table if not exists public.outfits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Outfits Schema Updates (Idempotent)
alter table public.outfits add column if not exists description text;
alter table public.outfits add column if not exists image_url text;
alter table public.outfits add column if not exists occasion text;
alter table public.outfits add column if not exists season text;
alter table public.outfits add column if not exists is_public boolean default false;


-- 4. OUTFIT ITEMS (Junction)
create table if not exists public.outfit_items (
  outfit_id uuid references public.outfits on delete cascade not null,
  clothing_item_id uuid references public.clothing_items on delete cascade not null,
  primary key (outfit_id, clothing_item_id)
);

-- Outfit Items Schema Updates
alter table public.outfit_items add column if not exists position_x numeric;
alter table public.outfit_items add column if not exists position_y numeric;
alter table public.outfit_items add column if not exists scale numeric;
alter table public.outfit_items add column if not exists rotation numeric;
alter table public.outfit_items add column if not exists layer_order integer;


-- 5. POSTS
create table if not exists public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Posts Schema Updates
alter table public.posts add column if not exists outfit_id uuid references public.outfits;
alter table public.posts add column if not exists caption text;


-- 6. FOLLOWS
create table if not exists public.follows (
  follower_id uuid references auth.users not null,
  following_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id)
);


-- 7. LIKES
create table if not exists public.likes (
  user_id uuid references auth.users not null,
  post_id uuid references public.posts on delete cascade,
  outfit_id uuid references public.outfits on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, post_id, outfit_id)
);

-- Likes Constraint (Check if existing constraint exists before adding? simpler to drop and add or ignore)
-- Instead of complex PL/SQL block, we'll try to add it. If it fails, it usually means it exists or data violates it.
-- This simple command might fail if constraint exists.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'one_target') then
    alter table public.likes add constraint one_target check (
      (post_id is not null and outfit_id is null) or 
      (post_id is null and outfit_id is not null)
    );
  end if;
end $$;


-- 8. COMMENTS
create table if not exists public.comments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  post_id uuid references public.posts on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- RLS POLICIES
-- Enabling RLS is safe to run multiple times
alter table public.profiles enable row level security;
alter table public.clothing_items enable row level security;
alter table public.outfits enable row level security;
alter table public.outfit_items enable row level security;
alter table public.posts enable row level security;
alter table public.follows enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;

-- Policies (Drop before create to avoid "policy already exists" error)
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can view own clothing items" on public.clothing_items;
create policy "Users can view own clothing items" on public.clothing_items for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own clothing items" on public.clothing_items;
create policy "Users can insert own clothing items" on public.clothing_items for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own clothing items" on public.clothing_items;
create policy "Users can update own clothing items" on public.clothing_items for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own clothing items" on public.clothing_items;
create policy "Users can delete own clothing items" on public.clothing_items for delete using (auth.uid() = user_id);

drop policy if exists "Users can view own outfits" on public.outfits;
create policy "Users can view own outfits" on public.outfits for select using (auth.uid() = user_id);

drop policy if exists "Users can view public outfits" on public.outfits;
create policy "Users can view public outfits" on public.outfits for select using (is_public = true);

drop policy if exists "Users can insert own outfits" on public.outfits;
create policy "Users can insert own outfits" on public.outfits for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own outfits" on public.outfits;
create policy "Users can update own outfits" on public.outfits for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own outfits" on public.outfits;
create policy "Users can delete own outfits" on public.outfits for delete using (auth.uid() = user_id);

drop policy if exists "Posts are viewable by everyone" on public.posts;
create policy "Posts are viewable by everyone" on public.posts for select using (true);

drop policy if exists "Users can insert own posts" on public.posts;
create policy "Users can insert own posts" on public.posts for insert with check (auth.uid() = user_id);

-- USER HANDLE TRIGGER
-- Drop first to allow updates
drop trigger if exists on_auth_user_created on auth.users;

create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing; -- Safe if profile already exists
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
