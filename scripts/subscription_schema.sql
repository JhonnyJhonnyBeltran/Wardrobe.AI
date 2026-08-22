-- ==============================================================================
-- WARDROBE.AI / KLOE PRO - SUBSCRIPTION & MONETIZATION DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Add subscription columns to public.profiles table (safe IF NOT EXISTS)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- 2. Create index on stripe_customer_id for lightning-fast webhook lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
ON public.profiles(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_profiles_is_premium 
ON public.profiles(is_premium);

-- 3. Set ETHAN user as lifetime PREMIUM (Yearly plan active)
UPDATE public.profiles
SET 
  is_premium = TRUE,
  subscription_tier = 'premium',
  subscription_plan = 'yearly',
  subscription_status = 'active',
  subscription_period_end = NOW() + INTERVAL '10 years'
WHERE 
  LOWER(username) = 'ethan' 
  OR LOWER(full_name) LIKE '%ethan%'
  OR id IN (
    SELECT id FROM auth.users WHERE LOWER(email) LIKE '%ethan%'
  );

-- 4. Ensure all other non-paying users are properly initialized to FREE
UPDATE public.profiles
SET 
  is_premium = FALSE,
  subscription_tier = 'free',
  subscription_plan = 'none',
  subscription_status = 'inactive'
WHERE 
  is_premium IS NULL 
  OR (
    is_premium = TRUE 
    AND LOWER(username) != 'ethan' 
    AND (stripe_subscription_id IS NULL OR stripe_subscription_id = '')
  );

-- 5. Helper view to see all subscriptions, plan type (Mensual / Anual) & status
CREATE OR REPLACE VIEW public.v_user_subscriptions AS
SELECT 
  p.id AS user_id,
  p.username,
  p.full_name,
  u.email,
  p.is_premium,
  p.subscription_tier,
  p.subscription_plan,
  p.subscription_status,
  p.subscription_period_end,
  p.stripe_customer_id,
  p.stripe_subscription_id,
  u.created_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.is_premium DESC, u.created_at DESC;

-- 6. Helper query to check paid users:
-- SELECT * FROM public.v_user_subscriptions WHERE is_premium = TRUE;
