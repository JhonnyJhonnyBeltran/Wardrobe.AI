-- Migration: Protect Subscription and Premium Fields from Client-Side Tampering
-- Ensures only service_role (Stripe / RevenueCat backend handlers) can modify is_premium or subscription columns.

CREATE OR REPLACE FUNCTION public.protect_profile_subscription_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Allow service_role or superuser (backend webhooks & verify endpoints)
  IF current_user = 'postgres' OR auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- For standard authenticated or anon users, block manual alteration of subscription state
  IF (NEW.is_premium IS DISTINCT FROM OLD.is_premium) OR
     (NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier) OR
     (NEW.subscription_status IS DISTINCT FROM OLD.subscription_status) OR
     (NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan) OR
     (NEW.subscription_period_end IS DISTINCT FROM OLD.subscription_period_end) OR
     (NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id) OR
     (NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id) OR
     (NEW.stripe_price_id IS DISTINCT FROM OLD.stripe_price_id) THEN

    -- Silently preserve the authoritative database values
    NEW.is_premium := OLD.is_premium;
    NEW.subscription_tier := OLD.subscription_tier;
    NEW.subscription_status := OLD.subscription_status;
    NEW.subscription_plan := OLD.subscription_plan;
    NEW.subscription_period_end := OLD.subscription_period_end;
    NEW.stripe_customer_id := OLD.stripe_customer_id;
    NEW.stripe_subscription_id := OLD.stripe_subscription_id;
    NEW.stripe_price_id := OLD.stripe_price_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_subscription_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_subscription_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_subscription_fields();
