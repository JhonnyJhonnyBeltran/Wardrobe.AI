/**
 * 💾 Outfit Database Service
 * 
 * Simple JSON-based database for storing generated outfits, user favorites,
 * and outfit history. For production, replace with a real database.
 */

import { GeneratedOutfit } from './outfitGenerator';
import * as fs from 'fs/promises';
import path from 'path';

// ==================== TYPES ====================

export interface SavedOutfit extends GeneratedOutfit {
    savedAt: string;
    userId?: string;
    favorite: boolean;
    views: number;
    shares: number;
}

export interface UserOutfitHistory {
    id: string;
    outfitId: string;
    userId: string;
    action: 'generated' | 'viewed' | 'saved' | 'shared' | 'purchased';
    timestamp: string;
}

export interface OutfitDatabase {
    outfits: SavedOutfit[];
    history: UserOutfitHistory[];
    stats: {
        totalGenerated: number;
        totalSaved: number;
        totalShared: number;
        lastUpdated: string;
    };
}

// ==================== FILE PATHS ====================

const DATA_DIR = path.join(process.cwd(), 'data');
const OUTFITS_DB_FILE = path.join(DATA_DIR, 'outfitsDb.json');

// ==================== DATABASE OPERATIONS ====================

/**
 * Initialize database if it doesn't exist
 */
async function initDatabase(): Promise<OutfitDatabase> {
    const defaultDb: OutfitDatabase = {
        outfits: [],
        history: [],
        stats: {
            totalGenerated: 0,
            totalSaved: 0,
            totalShared: 0,
            lastUpdated: new Date().toISOString(),
        },
    };

    try {
        await fs.access(OUTFITS_DB_FILE);
        const data = await fs.readFile(OUTFITS_DB_FILE, 'utf-8');
        return JSON.parse(data) as OutfitDatabase;
    } catch {
        // File doesn't exist, create it
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.writeFile(OUTFITS_DB_FILE, JSON.stringify(defaultDb, null, 2));
        return defaultDb;
    }
}

/**
 * Load database
 */
export async function loadOutfitDatabase(): Promise<OutfitDatabase> {
    try {
        const data = await fs.readFile(OUTFITS_DB_FILE, 'utf-8');
        return JSON.parse(data) as OutfitDatabase;
    } catch {
        return initDatabase();
    }
}

/**
 * Save database
 */
async function saveOutfitDatabase(db: OutfitDatabase): Promise<void> {
    db.stats.lastUpdated = new Date().toISOString();
    await fs.writeFile(OUTFITS_DB_FILE, JSON.stringify(db, null, 2));
}

// ==================== OUTFIT OPERATIONS ====================

/**
 * Save a generated outfit to the database
 */
export async function saveOutfit(
    outfit: GeneratedOutfit,
    userId?: string
): Promise<SavedOutfit> {
    const db = await loadOutfitDatabase();

    // Check if outfit already exists
    const existing = db.outfits.find(o => o.id === outfit.id);
    if (existing) {
        return existing;
    }

    const savedOutfit: SavedOutfit = {
        ...outfit,
        savedAt: new Date().toISOString(),
        userId,
        favorite: false,
        views: 0,
        shares: 0,
    };

    db.outfits.push(savedOutfit);
    db.stats.totalGenerated++;
    db.stats.totalSaved++;

    // Record history
    if (userId) {
        db.history.push({
            id: `hist-${Date.now()}`,
            outfitId: outfit.id,
            userId,
            action: 'saved',
            timestamp: new Date().toISOString(),
        });
    }

    await saveOutfitDatabase(db);
    return savedOutfit;
}

/**
 * Get outfit by ID
 */
export async function getOutfitById(outfitId: string): Promise<SavedOutfit | null> {
    const db = await loadOutfitDatabase();
    return db.outfits.find(o => o.id === outfitId) || null;
}

/**
 * Get all outfits (with optional filters)
 */
export async function getOutfits(options?: {
    userId?: string;
    style?: string;
    occasion?: string;
    favorite?: boolean;
    limit?: number;
    offset?: number;
}): Promise<{ outfits: SavedOutfit[]; total: number }> {
    const db = await loadOutfitDatabase();
    let filtered = [...db.outfits];

    if (options?.userId) {
        filtered = filtered.filter(o => o.userId === options.userId);
    }
    if (options?.style) {
        filtered = filtered.filter(o => o.style === options.style);
    }
    if (options?.occasion) {
        filtered = filtered.filter(o => o.occasion === options.occasion);
    }
    if (options?.favorite !== undefined) {
        filtered = filtered.filter(o => o.favorite === options.favorite);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) =>
        new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );

    const total = filtered.length;
    const offset = options?.offset || 0;
    const limit = options?.limit || 20;

    return {
        outfits: filtered.slice(offset, offset + limit),
        total,
    };
}

/**
 * Get trending outfits (most viewed/shared)
 */
export async function getTrendingOutfits(limit: number = 10): Promise<SavedOutfit[]> {
    const db = await loadOutfitDatabase();

    return db.outfits
        .sort((a, b) => (b.views + b.shares * 2) - (a.views + a.shares * 2))
        .slice(0, limit);
}

/**
 * Get recent outfits
 */
export async function getRecentOutfits(limit: number = 10): Promise<SavedOutfit[]> {
    const db = await loadOutfitDatabase();

    return db.outfits
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
}

/**
 * Toggle outfit favorite status
 */
export async function toggleFavorite(outfitId: string, userId?: string): Promise<boolean> {
    const db = await loadOutfitDatabase();
    const outfit = db.outfits.find(o => o.id === outfitId);

    if (!outfit) return false;

    outfit.favorite = !outfit.favorite;

    if (userId) {
        db.history.push({
            id: `hist-${Date.now()}`,
            outfitId,
            userId,
            action: outfit.favorite ? 'saved' : 'viewed',
            timestamp: new Date().toISOString(),
        });
    }

    await saveOutfitDatabase(db);
    return outfit.favorite;
}

/**
 * Record outfit view
 */
export async function recordOutfitView(outfitId: string, userId?: string): Promise<void> {
    const db = await loadOutfitDatabase();
    const outfit = db.outfits.find(o => o.id === outfitId);

    if (outfit) {
        outfit.views++;

        if (userId) {
            db.history.push({
                id: `hist-${Date.now()}`,
                outfitId,
                userId,
                action: 'viewed',
                timestamp: new Date().toISOString(),
            });
        }

        await saveOutfitDatabase(db);
    }
}

/**
 * Record outfit share
 */
export async function recordOutfitShare(outfitId: string, userId?: string): Promise<void> {
    const db = await loadOutfitDatabase();
    const outfit = db.outfits.find(o => o.id === outfitId);

    if (outfit) {
        outfit.shares++;
        db.stats.totalShared++;

        if (userId) {
            db.history.push({
                id: `hist-${Date.now()}`,
                outfitId,
                userId,
                action: 'shared',
                timestamp: new Date().toISOString(),
            });
        }

        await saveOutfitDatabase(db);
    }
}

/**
 * Delete outfit
 */
export async function deleteOutfit(outfitId: string): Promise<boolean> {
    const db = await loadOutfitDatabase();
    const index = db.outfits.findIndex(o => o.id === outfitId);

    if (index === -1) return false;

    db.outfits.splice(index, 1);
    await saveOutfitDatabase(db);
    return true;
}

/**
 * Get user outfit history
 */
export async function getUserHistory(
    userId: string,
    limit: number = 50
): Promise<UserOutfitHistory[]> {
    const db = await loadOutfitDatabase();

    return db.history
        .filter(h => h.userId === userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<OutfitDatabase['stats'] & {
    outfitsCount: number;
    historyCount: number;
    favoriteCount: number;
}> {
    const db = await loadOutfitDatabase();

    return {
        ...db.stats,
        outfitsCount: db.outfits.length,
        historyCount: db.history.length,
        favoriteCount: db.outfits.filter(o => o.favorite).length,
    };
}

/**
 * Clean old outfits (keep last N days)
 */
export async function cleanOldOutfits(daysToKeep: number = 90): Promise<number> {
    const db = await loadOutfitDatabase();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const originalCount = db.outfits.length;

    // Keep favorites regardless of age
    db.outfits = db.outfits.filter(o =>
        o.favorite || new Date(o.createdAt) >= cutoffDate
    );

    const removedCount = originalCount - db.outfits.length;

    if (removedCount > 0) {
        await saveOutfitDatabase(db);
    }

    return removedCount;
}
