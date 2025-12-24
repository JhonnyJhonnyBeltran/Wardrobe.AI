/**
 * 🤖 Fashion Bot - AI Microservice
 * 
 * Main entry point for the fashion scraping and AI outfit generation service.
 * Features:
 * - Periodic scraping of fashion sources (RSS, websites, retailers)
 * - AI-powered outfit generation using OpenAI
 * - REST API for the main Klozet app to consume
 * - Real-time trend analysis
 */

import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { setupRoutes } from './routes/index.js';
import { ScrapingService } from './services/ScrapingService.js';
import { AIService } from './services/AIService.js';
import { DataStore } from './services/DataStore.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.MAIN_APP_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

// Initialize services
const dataStore = new DataStore();
const scrapingService = new ScrapingService(dataStore);
const aiService = new AIService(dataStore);

// Setup routes
setupRoutes(app, { dataStore, scrapingService, aiService });

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'fashion-bot',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

// ==================== CRON JOBS ====================

// Daily scraping at 6 AM
if (process.env.SCRAPING_ENABLED === 'true') {
    const dailyHour = process.env.SCRAPING_DAILY_HOUR || '6';

    cron.schedule(`0 ${dailyHour} * * *`, async () => {
        logger.info('🕐 Starting daily scraping job...');
        try {
            await scrapingService.runDailyScrape();
            logger.info('✅ Daily scraping completed');
        } catch (error) {
            logger.error('❌ Daily scraping failed:', error);
        }
    });

    // Weekly deep scrape on Sundays at 3 AM
    const weeklyDay = process.env.SCRAPING_WEEKLY_DAY || '0';
    cron.schedule(`0 3 * * ${weeklyDay}`, async () => {
        logger.info('🕐 Starting weekly deep scraping job...');
        try {
            await scrapingService.runWeeklyScrape();
            logger.info('✅ Weekly scraping completed');
        } catch (error) {
            logger.error('❌ Weekly scraping failed:', error);
        }
    });

    logger.info(`📅 Scraping scheduled: Daily at ${dailyHour}:00, Weekly on day ${weeklyDay}`);
}

// ==================== START SERVER ====================

app.listen(PORT, () => {
    logger.info(`🚀 Fashion Bot running on port ${PORT}`);
    logger.info(`📡 Main app URL: ${process.env.MAIN_APP_URL || 'http://localhost:3000'}`);
    logger.info(`🤖 AI Service: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured'}`);

    // Initial data load
    dataStore.loadData().then(() => {
        logger.info('📦 Data store loaded');
    }).catch(err => {
        logger.warn('⚠️ Could not load existing data:', err.message);
    });
});

export { app, dataStore, scrapingService, aiService };
