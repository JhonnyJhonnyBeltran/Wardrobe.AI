/**
 * Clothing item type definitions
 */

export enum ClothingCategory {
  TOP = 'top',
  BOTTOM = 'bottom',
  DRESS = 'dress',
  OUTERWEAR = 'outerwear',
  SHOES = 'shoes',
  ACCESSORY = 'accessory',
}

export enum ClothingColor {
  BLACK = 'black',
  WHITE = 'white',
  GRAY = 'gray',
  BEIGE = 'beige',
  BROWN = 'brown',
  BLUE = 'blue',
  RED = 'red',
  GREEN = 'green',
  PINK = 'pink',
  YELLOW = 'yellow',
  PURPLE = 'purple',
  ORANGE = 'orange',
}

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  FALL = 'fall',
  WINTER = 'winter',
  ALL_SEASON = 'all-season',
}

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  color: ClothingColor;
  imageUrl?: string;
  season: Season[];
  brand?: string;
  tags?: string[];
  createdAt: Date;
  favorite?: boolean;
}
