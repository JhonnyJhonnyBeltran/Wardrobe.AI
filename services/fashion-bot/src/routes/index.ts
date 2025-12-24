/**
 * 🛣️ API Routes
 * 
 * REST API endpoints for the fashion bot microservice
 */

import { Express, Request, Response } from 'express';
import { DataStore } from '../services/DataStore.js';
import { ScrapingService } from '../services/ScrapingService.js';
import { AIService, OutfitRequest } from '../services/AIService.js';
import { logger } from '../utils/logger.js';

interface Services {
    dataStore: DataStore;
    scrapingService: ScrapingService;
    aiService: AIService;
}

export function setupRoutes(app: Express, services: Services): void {
    const { dataStore, scrapingService, aiService } = services;

    // ==================== OUTFIT GENERATION ====================

    /**
     * POST /api/generate
     * Generate a new outfit with AI
     */
    app.post('/api/generate', async (req: Request, res: Response) => {
        try {
            const request: OutfitRequest = {
                style: req.body.style,
                occasion: req.body.occasion,
                season: req.body.season,
                preferredColors: req.body.preferredColors,
                preferredBrands: req.body.preferredBrands,
                priceRange: req.body.priceRange,
                mood: req.body.mood,
                description: req.body.description,
            };

            logger.info('📥 Generate outfit request:', request);

            const outfit = await aiService.generateOutfit(request);

            // Save data after generation
            await dataStore.saveData();

            res.json({
                success: true,
                outfit,
                meta: {
                    aiGenerated: outfit.aiGenerated,
                    timestamp: new Date().toISOString(),
                },
            });
        } catch (error) {
            logger.error('Generate outfit error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate outfit',
            });
        }
    });

    /**
     * POST /api/generate/multiple
     * Generate multiple outfits at once
     */
    app.post('/api/generate/multiple', async (req: Request, res: Response) => {
        try {
            const count = Math.min(req.body.count || 3, 10);
            const request: OutfitRequest = req.body.options || {};

            logger.info(`📥 Generate ${count} outfits request`);

            const outfits = await aiService.generateMultipleOutfits(request, count);

            await dataStore.saveData();

            res.json({
                success: true,
                count: outfits.length,
                outfits,
            });
        } catch (error) {
            logger.error('Generate multiple error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate outfits',
            });
        }
    });

    /**
     * POST /api/generate/from-description
     * Generate outfit from natural language description
     */
    app.post('/api/generate/from-description', async (req: Request, res: Response) => {
        try {
            const { description } = req.body;

            if (!description) {
                return res.status(400).json({
                    success: false,
                    error: 'Description is required',
                });
            }

            logger.info('📥 Generate from description:', description);

            const outfit = await aiService.generateFromDescription(description);

            await dataStore.saveData();

            res.json({
                success: true,
                outfit,
            });
        } catch (error) {
            logger.error('Generate from description error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate outfit',
            });
        }
    });

    // ==================== OUTFITS ====================

    /**
     * GET /api/outfits
     * Get all generated outfits
     */
    app.get('/api/outfits', (req: Request, res: Response) => {
        try {
            const limit = parseInt(req.query.limit as string) || 20;
            const outfits = dataStore.getRecentOutfits(limit);

            res.json({
                success: true,
                count: outfits.length,
                outfits,
            });
        } catch (error) {
            logger.error('Get outfits error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get outfits',
            });
        }
    });

    /**
     * GET /api/outfits/:id
     * Get outfit by ID
     */
    app.get('/api/outfits/:id', (req: Request, res: Response) => {
        try {
            const outfit = dataStore.getOutfits().find(o => o.id === req.params.id);

            if (!outfit) {
                return res.status(404).json({
                    success: false,
                    error: 'Outfit not found',
                });
            }

            res.json({
                success: true,
                outfit,
            });
        } catch (error) {
            logger.error('Get outfit error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get outfit',
            });
        }
    });

    /**
     * GET /api/outfits/:id/suggestions
     * Get improvement suggestions for an outfit
     */
    app.get('/api/outfits/:id/suggestions', async (req: Request, res: Response) => {
        try {
            const suggestions = await aiService.suggestImprovements(req.params.id);

            res.json({
                success: true,
                outfitId: req.params.id,
                suggestions,
            });
        } catch (error) {
            logger.error('Get suggestions error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get suggestions',
            });
        }
    });

    // ==================== TRENDS ====================

    /**
     * GET /api/trends
     * Get all fashion trends
     */
    app.get('/api/trends', (req: Request, res: Response) => {
        try {
            const limit = parseInt(req.query.limit as string) || 20;
            const trends = dataStore.getTopTrends(limit);

            res.json({
                success: true,
                count: trends.length,
                trends,
            });
        } catch (error) {
            logger.error('Get trends error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get trends',
            });
        }
    });

    // ==================== ITEMS ====================

    /**
     * GET /api/items
     * Get all fashion items
     */
    app.get('/api/items', (req: Request, res: Response) => {
        try {
            const type = req.query.type as string;
            const trending = req.query.trending === 'true';

            let items = dataStore.getItems();

            if (type) {
                items = items.filter(i => i.type === type);
            }

            if (trending) {
                items = items.filter(i => i.trending);
            }

            res.json({
                success: true,
                count: items.length,
                items,
            });
        } catch (error) {
            logger.error('Get items error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get items',
            });
        }
    });

    // ==================== BRANDS ====================

    /**
     * GET /api/brands
     * Get all brands
     */
    app.get('/api/brands', (req: Request, res: Response) => {
        try {
            const brands = dataStore.getBrands();

            res.json({
                success: true,
                count: brands.length,
                brands,
            });
        } catch (error) {
            logger.error('Get brands error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get brands',
            });
        }
    });

    // ==================== SCRAPING ====================

    /**
     * POST /api/scrape
     * Trigger manual scraping
     */
    app.post('/api/scrape', async (req: Request, res: Response) => {
        try {
            const { type = 'daily', secret } = req.body;

            // Simple authentication
            if (process.env.API_SECRET && secret !== process.env.API_SECRET) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                });
            }

            logger.info(`📥 Manual scrape request: ${type}`);

            let results;
            if (type === 'weekly') {
                results = await scrapingService.runWeeklyScrape();
            } else {
                results = await scrapingService.runDailyScrape();
            }

            res.json({
                success: true,
                type,
                results: results.map(r => ({
                    source: r.source,
                    trends: r.trends.length,
                    items: r.items.length,
                    brands: r.brands.length,
                    error: r.error,
                })),
            });
        } catch (error) {
            logger.error('Scrape error:', error);
            res.status(500).json({
                success: false,
                error: 'Scraping failed',
            });
        }
    });

    /**
     * GET /api/scrape/status
     * Get scraping status
     */
    app.get('/api/scrape/status', (req: Request, res: Response) => {
        try {
            const status = scrapingService.getStatus();

            res.json({
                success: true,
                ...status,
            });
        } catch (error) {
            logger.error('Get scrape status error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get status',
            });
        }
    });

    // ==================== DATA ====================

    /**
     * GET /api/data
     * Get all fashion data (for main app sync)
     */
    app.get('/api/data', (req: Request, res: Response) => {
        try {
            res.json({
                success: true,
                data: {
                    trends: dataStore.getTrends(),
                    items: dataStore.getItems(),
                    brands: dataStore.getBrands(),
                },
                stats: dataStore.getStats(),
            });
        } catch (error) {
            logger.error('Get data error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get data',
            });
        }
    });

    /**
     * GET /api/stats
     * Get service statistics
     */
    app.get('/api/stats', (req: Request, res: Response) => {
        try {
            res.json({
                success: true,
                dataStore: dataStore.getStats(),
                scraping: scrapingService.getStatus(),
                ai: aiService.getStatus(),
            });
        } catch (error) {
            logger.error('Get stats error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get stats',
            });
        }
    });

    logger.info('✅ API routes configured');
}
