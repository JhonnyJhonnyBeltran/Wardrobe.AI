/**
 * Outfit type definitions
 */

import { ClothingItem } from './clothing';

export enum OutfitOccasion {
  CASUAL = 'casual',
  FORMAL = 'formal',
  BUSINESS = 'business',
  PARTY = 'party',
  SPORT = 'sport',
  DATE = 'date',
  EVERYDAY = 'everyday',
}

export interface Outfit {
  id: string;
  name: string;
  items: ClothingItem[];
  occasion: OutfitOccasion;
  season: string;
  createdAt: Date;
  imageUrl?: string;
  aiGenerated: boolean;
  favorite?: boolean;
  isPublic?: boolean;
  description?: string;
  // UI Helpers (mapped from DB or calculated)
  style?: string; // e.g. from tags or occasion
  date?: string;  // formatted date string
}

export interface OutfitGenerationRequest {
  occasion: OutfitOccasion;
  season: string;
  preferredColors?: string[];
  availableItems?: string[]; // IDs of available clothing items
}
