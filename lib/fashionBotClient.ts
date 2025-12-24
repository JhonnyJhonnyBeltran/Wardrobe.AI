/**
 * 🔗 Fashion Bot Client
 * 
 * Client library for connecting the main Klozet app to the Fashion Bot microservice.
 * Provides methods for outfit generation, data sync, and status checks.
 */

// ==================== TYPES ====================

export interface BotOutfitRequest {
    style?: string;
    occasion?: string;
    season?: string;
    preferredColors?: string[];
    preferredBrands?: string[];
    priceRange?: 'budget' | 'mid' | 'premium' | 'luxury' | 'any';
    mood?: string;
    description?: string;
}

export interface BotOutfitItem {
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

export interface BotGeneratedOutfit {
    id: string;
    name: string;
    style: string;
    occasion: string;
    season: string;
    description: string;
    items: BotOutfitItem[];
    totalItems: number;
    trendingScore: number;
    estimatedPrice?: string;
    priceRange?: string;
    matchedTrends: string[];
    createdAt: string;
    aiGenerated: boolean;
    aiReasoning?: string;
}

export interface BotTrend {
    id: string;
    name: string;
    category: string;
    description: string;
    season: string;
    source: string;
    imageUrl?: string;
    popularity: number;
}

export interface BotItem {
    id: string;
    name: string;
    brand: string;
    type: string;
    color?: string;
    colorHex?: string;
    price?: string;
    imageUrl?: string;
    buyLink?: string;
    trending: boolean;
}

export interface BotStats {
    dataStore: {
        trendsCount: number;
        itemsCount: number;
        brandsCount: number;
        outfitsCount: number;
        lastUpdated: string;
    };
    scraping: {
        isRunning: boolean;
        lastRun: string | null;
        sources: string[];
    };
    ai: {
        isConfigured: boolean;
        model: string;
    };
}

// ==================== CLIENT CLASS ====================

export class FashionBotClient {
    private baseUrl: string;
    private timeout: number;

    constructor(options?: {
        baseUrl?: string;
        timeout?: number;
    }) {
        this.baseUrl = options?.baseUrl || process.env.NEXT_PUBLIC_FASHION_BOT_URL || 'http://localhost:3001';
        this.timeout = options?.timeout || 30000;
    }

    // ==================== HELPER ====================

    private async request<T>(
        method: 'GET' | 'POST',
        endpoint: string,
        body?: unknown
    ): Promise<T> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body ? JSON.stringify(body) : undefined,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if ((error as Error).name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    // ==================== HEALTH CHECK ====================

    async isHealthy(): Promise<boolean> {
        try {
            const response = await this.request<{ status: string }>('GET', '/health');
            return response.status === 'healthy';
        } catch {
            return false;
        }
    }

    async getHealth(): Promise<{
        status: string;
        service: string;
        version: string;
        uptime: number;
    }> {
        return this.request('GET', '/health');
    }

    // ==================== OUTFIT GENERATION ====================

    async generateOutfit(request: BotOutfitRequest = {}): Promise<BotGeneratedOutfit> {
        const response = await this.request<{
            success: boolean;
            outfit: BotGeneratedOutfit;
        }>('POST', '/api/generate', request);

        if (!response.success) {
            throw new Error('Failed to generate outfit');
        }

        return response.outfit;
    }

    async generateMultipleOutfits(
        request: BotOutfitRequest = {},
        count: number = 3
    ): Promise<BotGeneratedOutfit[]> {
        const response = await this.request<{
            success: boolean;
            outfits: BotGeneratedOutfit[];
        }>('POST', '/api/generate/multiple', {
            options: request,
            count,
        });

        if (!response.success) {
            throw new Error('Failed to generate outfits');
        }

        return response.outfits;
    }

    async generateFromDescription(description: string): Promise<BotGeneratedOutfit> {
        const response = await this.request<{
            success: boolean;
            outfit: BotGeneratedOutfit;
        }>('POST', '/api/generate/from-description', { description });

        if (!response.success) {
            throw new Error('Failed to generate outfit from description');
        }

        return response.outfit;
    }

    // ==================== OUTFITS ====================

    async getOutfits(limit: number = 20): Promise<BotGeneratedOutfit[]> {
        const response = await this.request<{
            success: boolean;
            outfits: BotGeneratedOutfit[];
        }>('GET', `/api/outfits?limit=${limit}`);

        return response.outfits || [];
    }

    async getOutfitById(id: string): Promise<BotGeneratedOutfit | null> {
        try {
            const response = await this.request<{
                success: boolean;
                outfit: BotGeneratedOutfit;
            }>('GET', `/api/outfits/${id}`);
            return response.outfit;
        } catch {
            return null;
        }
    }

    async getOutfitSuggestions(outfitId: string): Promise<string[]> {
        const response = await this.request<{
            success: boolean;
            suggestions: string[];
        }>('GET', `/api/outfits/${outfitId}/suggestions`);

        return response.suggestions || [];
    }

    // ==================== TRENDS ====================

    async getTrends(limit: number = 20): Promise<BotTrend[]> {
        const response = await this.request<{
            success: boolean;
            trends: BotTrend[];
        }>('GET', `/api/trends?limit=${limit}`);

        return response.trends || [];
    }

    // ==================== ITEMS ====================

    async getItems(options?: {
        type?: string;
        trending?: boolean;
    }): Promise<BotItem[]> {
        let query = '';
        if (options?.type) query += `type=${options.type}&`;
        if (options?.trending) query += `trending=true&`;

        const response = await this.request<{
            success: boolean;
            items: BotItem[];
        }>('GET', `/api/items?${query}`);

        return response.items || [];
    }

    // ==================== DATA SYNC ====================

    async syncData(): Promise<{
        trends: BotTrend[];
        items: BotItem[];
        brands: { id: string; name: string; tier: string }[];
    }> {
        const response = await this.request<{
            success: boolean;
            data: {
                trends: BotTrend[];
                items: BotItem[];
                brands: { id: string; name: string; tier: string }[];
            };
        }>('GET', '/api/data');

        return response.data;
    }

    // ==================== STATS ====================

    async getStats(): Promise<BotStats> {
        const response = await this.request<{
            success: boolean;
        } & BotStats>('GET', '/api/stats');

        return {
            dataStore: response.dataStore,
            scraping: response.scraping,
            ai: response.ai,
        };
    }

    // ==================== SCRAPING ====================

    async triggerScrape(type: 'daily' | 'weekly' = 'daily', secret?: string): Promise<{
        success: boolean;
        results: { source: string; trends: number; items: number }[];
    }> {
        return this.request('POST', '/api/scrape', { type, secret });
    }

    async getScrapingStatus(): Promise<{
        isRunning: boolean;
        lastRun: string | null;
        sources: string[];
    }> {
        const response = await this.request<{
            success: boolean;
            isRunning: boolean;
            lastRun: string | null;
            sources: string[];
        }>('GET', '/api/scrape/status');

        return {
            isRunning: response.isRunning,
            lastRun: response.lastRun,
            sources: response.sources,
        };
    }
}

// ==================== SINGLETON INSTANCE ====================

let clientInstance: FashionBotClient | null = null;

export function getFashionBotClient(): FashionBotClient {
    if (!clientInstance) {
        clientInstance = new FashionBotClient();
    }
    return clientInstance;
}

// ==================== REACT HOOK ====================

export function useFashionBot() {
    const client = getFashionBotClient();

    return {
        generateOutfit: client.generateOutfit.bind(client),
        generateMultiple: client.generateMultipleOutfits.bind(client),
        generateFromDescription: client.generateFromDescription.bind(client),
        getOutfits: client.getOutfits.bind(client),
        getTrends: client.getTrends.bind(client),
        getItems: client.getItems.bind(client),
        syncData: client.syncData.bind(client),
        getStats: client.getStats.bind(client),
        isHealthy: client.isHealthy.bind(client),
    };
}
