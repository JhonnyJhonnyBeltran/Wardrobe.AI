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
  isPublic?: boolean; // Si el outfit es público para el feed social
}

export interface OutfitGenerationRequest {
  occasion: OutfitOccasion;
  season: string;
  preferredColors?: string[];
  availableItems?: string[]; // IDs of available clothing items
}
