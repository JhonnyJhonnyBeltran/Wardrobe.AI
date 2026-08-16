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
  username?: string; // from profiles table
  bio?: string;      // from profiles table
  subscriptionTier: SubscriptionTier;
  avatar?: string;
  createdAt: Date;
  morphology?: string; // e.g., 'triangle', 'hourglass'
  colorimetry?: string; // e.g., 'winter', 'summer'

  // Style Questionnaire Fields
  ageRange?: '18-24' | '25-34' | '35-44' | '45-54' | '55+';
  gender?: 'woman' | 'man' | 'other';
  height?: number; // in cm
  heightRange?: 'short' | 'medium' | 'tall';
  preferredStyles?: string[]; // e.g., ['casual', 'sporty', 'elegant']
  usesAccessories?: boolean;
  visualStylePreferences?: string[]; // IDs of selected images from visual quiz
  styleCompleted?: boolean; // Has completed the style questionnaire
  isPrivate?: boolean; // Profile privacy
  notificationSettings?: { push: boolean; email: boolean } | any;
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

// Style Quiz Image Option
export interface StyleImageOption {
  id: string;
  imageUrl: string;
  styleTag: string; // e.g., 'minimalist', 'boho', 'street', 'classic'
  category?: string;
}
