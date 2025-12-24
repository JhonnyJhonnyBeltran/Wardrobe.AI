/**
 * 💾 Data Store Service
 * 
 * Manages fashion data persistence and provides access to trends, items, and brands.
 * Uses JSON files for storage (can be replaced with a database in production).
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

// ==================== TYPES ====================

export interface FashionTrend {
    id: string;
    name: string;
    category: 'color' | 'garment' | 'style' | 'accessory';
    description: string;
    season: string;
    source: string;
    sourceUrl?: string;
    imageUrl?: string;
    popularity: number; // 1-10
    relatedItems?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ShoppableItem {
    id: string;
    name: string;
    brand: string;
    type: 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'bag' | 'accessory';
    description?: string;
    color?: string;
    colorHex?: string;
    priceRange?: 'budget' | 'mid' | 'premium' | 'luxury';
    price?: string;
    imageUrl?: string;
    buyLink?: string;
    trending: boolean;
    trendIds: string[];
    source: string;
    createdAt: string;
}

export interface Brand {
    id: string;
    name: string;
    tier: 'fast-fashion' | 'contemporary' | 'premium' | 'designer' | 'luxury';
    trendingScore: number;
    website?: string;
    logoUrl?: string;
}

export interface GeneratedOutfit {
    id: string;
    name: string;
    style: string;
    occasion: string;
    season: string;
    description: string;
    items: OutfitItem[];
    totalItems: number;
    trendingScore: number;
    estimatedPrice?: string;
    priceRange?: string;
    matchedTrends: string[];
    createdAt: string;
    aiGenerated: boolean;
    aiPrompt?: string;
    aiReasoning?: string;
}

export interface OutfitItem {
    id: string;
    name: string;
    brand: string;
    type: string;
    color?: string;
    colorHex?: string;
    imageUrl?: string;
    buyLink?: string;
    price?: string;
    priceRange?: string;
    source: string;
    trending: boolean;
    matchScore: number;
}

export interface FashionDataStore {
    trends: FashionTrend[];
    items: ShoppableItem[];
    brands: Brand[];
    lastUpdated: string;
}

// ==================== DATA STORE ====================

export class DataStore {
    private dataDir: string;
    private fashionDataPath: string;
    private outfitsPath: string;

    private trends: FashionTrend[] = [];
    private items: ShoppableItem[] = [];
    private brands: Brand[] = [];
    private outfits: GeneratedOutfit[] = [];
    private lastUpdated: string = new Date().toISOString();

    constructor() {
        this.dataDir = path.join(process.cwd(), 'data');
        this.fashionDataPath = path.join(this.dataDir, 'fashionData.json');
        this.outfitsPath = path.join(this.dataDir, 'generatedOutfits.json');
    }

    // ==================== LOAD/SAVE ====================

    async loadData(): Promise<void> {
        try {
            await fs.mkdir(this.dataDir, { recursive: true });

            // Load fashion data
            try {
                const fashionData = await fs.readFile(this.fashionDataPath, 'utf-8');
                const parsed = JSON.parse(fashionData) as FashionDataStore;
                this.trends = parsed.trends || [];
                this.items = parsed.items || [];
                this.brands = parsed.brands || [];
                this.lastUpdated = parsed.lastUpdated || new Date().toISOString();
                logger.info(`Loaded ${this.trends.length} trends, ${this.items.length} items, ${this.brands.length} brands`);
            } catch {
                logger.info('No existing fashion data found, starting fresh');
            }

            // Load generated outfits
            try {
                const outfitsData = await fs.readFile(this.outfitsPath, 'utf-8');
                this.outfits = JSON.parse(outfitsData);
                logger.info(`Loaded ${this.outfits.length} generated outfits`);
            } catch {
                logger.info('No existing outfits found');
            }
        } catch (error) {
            logger.error('Error loading data:', error);
            throw error;
        }
    }

    async saveData(): Promise<void> {
        try {
            await fs.mkdir(this.dataDir, { recursive: true });

            const fashionData: FashionDataStore = {
                trends: this.trends,
                items: this.items,
                brands: this.brands,
                lastUpdated: new Date().toISOString(),
            };

            await fs.writeFile(this.fashionDataPath, JSON.stringify(fashionData, null, 2));
            await fs.writeFile(this.outfitsPath, JSON.stringify(this.outfits, null, 2));

            logger.info('Data saved successfully');
        } catch (error) {
            logger.error('Error saving data:', error);
            throw error;
        }
    }

    // ==================== GETTERS ====================

    getTrends(): FashionTrend[] {
        return this.trends;
    }

    getTrendById(id: string): FashionTrend | undefined {
        return this.trends.find(t => t.id === id);
    }

    getTopTrends(limit: number = 10): FashionTrend[] {
        return [...this.trends]
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, limit);
    }

    getItems(): ShoppableItem[] {
        return this.items;
    }

    getItemById(id: string): ShoppableItem | undefined {
        return this.items.find(i => i.id === id);
    }

    getItemsByType(type: string): ShoppableItem[] {
        return this.items.filter(i => i.type === type);
    }

    getTrendingItems(): ShoppableItem[] {
        return this.items.filter(i => i.trending);
    }

    getBrands(): Brand[] {
        return this.brands;
    }

    getOutfits(): GeneratedOutfit[] {
        return this.outfits;
    }

    getRecentOutfits(limit: number = 10): GeneratedOutfit[] {
        return [...this.outfits]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit);
    }

    getStats() {
        return {
            trendsCount: this.trends.length,
            itemsCount: this.items.length,
            brandsCount: this.brands.length,
            outfitsCount: this.outfits.length,
            lastUpdated: this.lastUpdated,
        };
    }

    // ==================== SETTERS ====================

    addTrend(trend: Omit<FashionTrend, 'id' | 'createdAt' | 'updatedAt'>): FashionTrend {
        const newTrend: FashionTrend = {
            ...trend,
            id: `trend-${uuidv4()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.trends.push(newTrend);
        return newTrend;
    }

    addItem(item: Omit<ShoppableItem, 'id' | 'createdAt'>): ShoppableItem {
        const newItem: ShoppableItem = {
            ...item,
            id: `item-${uuidv4()}`,
            createdAt: new Date().toISOString(),
        };
        this.items.push(newItem);
        return newItem;
    }

    addBrand(brand: Omit<Brand, 'id'>): Brand {
        const newBrand: Brand = {
            ...brand,
            id: `brand-${uuidv4()}`,
        };
        this.brands.push(newBrand);
        return newBrand;
    }

    addOutfit(outfit: Omit<GeneratedOutfit, 'id' | 'createdAt'>): GeneratedOutfit {
        const newOutfit: GeneratedOutfit = {
            ...outfit,
            id: `outfit-${uuidv4()}`,
            createdAt: new Date().toISOString(),
        };
        this.outfits.push(newOutfit);
        return newOutfit;
    }

    // Merge new data (for scraping updates)
    mergeData(newData: Partial<FashionDataStore>): void {
        if (newData.trends) {
            for (const trend of newData.trends) {
                const existing = this.trends.find(t => t.name.toLowerCase() === trend.name.toLowerCase());
                if (existing) {
                    Object.assign(existing, { ...trend, updatedAt: new Date().toISOString() });
                } else {
                    this.trends.push(trend);
                }
            }
        }

        if (newData.items) {
            for (const item of newData.items) {
                const existing = this.items.find(i =>
                    i.name.toLowerCase() === item.name.toLowerCase() &&
                    i.brand.toLowerCase() === item.brand.toLowerCase()
                );
                if (!existing) {
                    this.items.push(item);
                }
            }
        }

        if (newData.brands) {
            for (const brand of newData.brands) {
                const existing = this.brands.find(b => b.name.toLowerCase() === brand.name.toLowerCase());
                if (!existing) {
                    this.brands.push(brand);
                }
            }
        }

        this.lastUpdated = new Date().toISOString();
    }

    // Clean old data
    cleanOldData(daysToKeep: number = 90): number {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysToKeep);

        const beforeCount = this.items.length;
        this.items = this.items.filter(i =>
            new Date(i.createdAt) >= cutoff || i.trending
        );

        return beforeCount - this.items.length;
    }
}
