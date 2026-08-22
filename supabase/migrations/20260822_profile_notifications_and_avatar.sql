-- Migration: Notification Preferences, Private Profile & Virtual Avatar Calibration Photos
-- Description: Adds notification_preferences, is_private, and face_photos / body_photos to profiles table

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "popupToasts": true,
  "likes": true,
  "comments": true,
  "follows": true,
  "messages": true,
  "reminders": true,
  "email": false
}'::jsonb;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS face_photos TEXT[] DEFAULT '{}'::text[];

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS body_photos TEXT[] DEFAULT '{}'::text[];

-- Update follows table if needed for status
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'follows' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.follows ADD COLUMN status TEXT DEFAULT 'accepted';
  END IF;
END $$;
