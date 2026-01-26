-- Fix foreign key relationships for follows table to allow joins with profiles
-- This enables fetching follower details (username, avatar) in the followers list

-- 1. Drop existing constraints if they exist (PostgreSQL names them automatically, usually follows_follower_id_fkey)
-- We attempt to drop constraints that reference auth.users
DO $$ 
BEGIN
  -- Try to drop follower_id constraint
  BEGIN
    ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  -- Try to drop following_id constraint
  BEGIN
    ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_following_id_fkey;
  EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- 2. Add new constraints referencing public.profiles
-- Ensure we don't duplicate if they already exist properly
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'follows_follower_id_fkey_profiles'
  ) THEN
    ALTER TABLE public.follows
      ADD CONSTRAINT follows_follower_id_fkey_profiles
      FOREIGN KEY (follower_id)
      REFERENCES public.profiles(id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'follows_following_id_fkey_profiles'
  ) THEN
    ALTER TABLE public.follows
      ADD CONSTRAINT follows_following_id_fkey_profiles
      FOREIGN KEY (following_id)
      REFERENCES public.profiles(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Verify the layout
COMMENT ON TABLE public.follows IS 'Table with updated Foreign Keys to profiles';
