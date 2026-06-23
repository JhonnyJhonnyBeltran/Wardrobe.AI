-- ============================================
-- KLOZET: CALENDARIO DE OUTFITS
-- ============================================

CREATE TABLE IF NOT EXISTS public.calendar_outfits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  outfit_id UUID REFERENCES public.outfits ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, date, outfit_id)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.calendar_outfits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own calendar" ON public.calendar_outfits 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own calendar" ON public.calendar_outfits 
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_calendar_user_date ON public.calendar_outfits(user_id, date);
