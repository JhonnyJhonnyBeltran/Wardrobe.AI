import Stripe from 'stripe';

export function getStripe(): Stripe {
  const key = (process.env.STRIPE_SECRET_KEY || '').trim();
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY no está configurada en el servidor.');
  }

  return new Stripe(key, {
    apiVersion: '2025-02-24.acacia' as any,
    appInfo: {
      name: 'Wardrobe.AI',
      version: '1.0.0'
    }
  });
}

// Lazy-loaded singleton instance
let stripeInstance: Stripe | null = null;

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    if (!stripeInstance) {
      stripeInstance = getStripe();
    }
    const val = (stripeInstance as any)[prop];
    return typeof val === 'function' ? val.bind(stripeInstance) : val;
  }
});
