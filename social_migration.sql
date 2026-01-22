-- Social Features Update

-- 1. Update Profiles
-- Ensure we have bio and username logic is sound
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;

-- 2. Update Follows for Request System
-- status: 'pending', 'accepted'
ALTER TABLE public.follows ADD COLUMN IF NOT EXISTS status text DEFAULT 'accepted';

-- 3. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id uuid REFERENCES auth.users NOT NULL,
  receiver_id uuid REFERENCES auth.users NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS on Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 5. Message Policies
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 6. Helper function to search users (optional, but good for performance if using large datasets)
-- For now, simple client-side search on profiles table is fine for MVP.
