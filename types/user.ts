/**
 * User and subscription type definitions
 */

export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  subscriptionTier: SubscriptionTier;
  avatar?: string;
  createdAt: Date;
  morphology?: string; // e.g., 'triangle', 'hourglass'
  colorimetry?: string; // e.g., 'winter', 'summer'
}

export interface UserPreferences {
  favoriteColors?: string[];
  style?: string;
  sizes?: {
    top?: string;
    bottom?: string;
    shoe?: string;
  };
}
