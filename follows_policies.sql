-- Enable RLS on follows table if not already
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see all follows (public social graph)
DROP POLICY IF EXISTS "Public follows are visible" ON public.follows;
CREATE POLICY "Public follows are visible" ON public.follows
  FOR SELECT USING (true);

-- Policy: Users can create a follow request for themselves (acting as follower)
DROP POLICY IF EXISTS "Users can create follow requests" ON public.follows;
CREATE POLICY "Users can create follow requests" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Policy: Users can delete their own follow requests (unfollow) OR remove followers
DROP POLICY IF EXISTS "Users can delete follows" ON public.follows;
CREATE POLICY "Users can delete follows" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Policy: Users can update status (accept requests) if they are the one being followed
DROP POLICY IF EXISTS "Users can update follow status" ON public.follows;
CREATE POLICY "Users can update follow status" ON public.follows
  FOR UPDATE USING (auth.uid() = following_id);
