-- Migration: Protect calendar_outfits so only verified Premium users can schedule outfits
-- Prevents unpaid users from bypassing client UI using browser console or API scripts.

CREATE OR REPLACE FUNCTION public.check_calendar_outfits_premium()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_premium boolean;
  v_sub_tier text;
  v_sub_status text;
  v_period_end timestamptz;
BEGIN
  -- Allow service_role or admin
  IF current_user = 'postgres' OR auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Verify user is truly premium in public.profiles
  SELECT is_premium, subscription_tier, subscription_status, subscription_period_end
  INTO v_is_premium, v_sub_tier, v_sub_status, v_period_end
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Block if not premium or if past the 3-day grace period
  IF (COALESCE(v_is_premium, false) = false AND COALESCE(v_sub_tier, 'free') <> 'premium') OR
     (v_sub_status IN ('unpaid', 'incomplete_expired', 'expired')) OR
     (v_period_end IS NOT NULL AND v_period_end < (NOW() - INTERVAL '3 days')) THEN
    RAISE EXCEPTION 'Programar outfits en el calendario es exclusivo de Klozet Pro'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_calendar_outfits_premium ON public.calendar_outfits;
CREATE TRIGGER trg_check_calendar_outfits_premium
BEFORE INSERT OR UPDATE ON public.calendar_outfits
FOR EACH ROW
EXECUTE FUNCTION public.check_calendar_outfits_premium();
