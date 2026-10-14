'use client';

import { loadStripe, Stripe as StripeClient } from '@stripe/stripe-js';

const DEFAULT_PUB_KEY = 'pk_live_51U7DSzCt6LJbs620hzjbkzkfkJpezwCTe81mZWEESdqSmkk2uGFYMwsi0XnmTL8uKmc0hUgSo1sNNH99ERGF4oDh00Q5SinGk8';

let stripePromise: Promise<StripeClient | null> | null = null;

export function getStripeClientPromise(): Promise<StripeClient | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || DEFAULT_PUB_KEY;
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}
