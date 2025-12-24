/**
 * 🤖 AI Service
 * 
 * Uses OpenAI to dynamically generate outfit combinations based on:
 * - Current fashion trends
 * - User preferences
 * - Occasion and season
 * - Available items in the data store
 */

import OpenAI from 'openai';
import { logger } from '../utils/logger.js';
import { DataStore, GeneratedOutfit, OutfitItem, ShoppableItem, FashionTrend } from './DataStore.js';

// ==================== TYPES ====================

export interface OutfitRequest {
    style?: string;
    occasion?: string;
    season?: string;
    preferredColors?: string[];
    preferredBrands?: string[];
    priceRange?: 'budget' | 'mid' | 'premium' | 'luxury' | 'any';
    mood?: string;
    description?: string;
}

interface AIOutfitSuggestion {
    name: string;
    description: string;
    style: string;
    reasoning: string;
    items: {
        type: string;
        attributes: string[];
        priority: number;
    }[];
    colorPalette: string[];
    trends: string[];
}

// ==================== AI SERVICE ====================

export class AIService {
    private openai: OpenAI | null = null;
    private dataStore: DataStore;
    private isConfigured: boolean = false;

    constructor(dataStore: DataStore) {
        this.dataStore = dataStore;

        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
            this.isConfigured = true;
            logger.info('✅ AI Service configured with OpenAI');
        } else {
            logger.warn('⚠️ OpenAI API key not found, using fallback generation');
        }
    }

    // ==================== MAIN GENERATION ====================

    async generateOutfit(request: OutfitRequest): Promise<GeneratedOutfit> {
        logger.info('🎨 Generating outfit...', { request });

        if (this.isConfigured && this.openai) {
            return this.generateWithAI(request);
        } else {
            return this.generateWithFallback(request);
        }
    }

    // ==================== AI-POWERED GENERATION ====================

    private async generateWithAI(request: OutfitRequest): Promise<GeneratedOutfit> {
        const trends = this.dataStore.getTopTrends(10);
        const items = this.dataStore.getTrendingItems();

        const prompt = this.buildPrompt(request, trends, items);

        try {
            const completion = await this.openai!.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `Eres un estilista de moda experto. Tu trabajo es crear outfits coherentes y trendy basados en las tendencias actuales y los items disponibles. Responde SIEMPRE en JSON válido.`,
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.8,
                max_tokens: 1500,
            });

            const aiResponse = JSON.parse(completion.choices[0].message.content || '{}') as AIOutfitSuggestion;

            logger.info('🤖 AI generated suggestion:', { name: aiResponse.name });

            return this.buildOutfitFromAI(aiResponse, request, items);
        } catch (error) {
            logger.error('AI generation error:', error);
            return this.generateWithFallback(request);
        }
    }

    private buildPrompt(request: OutfitRequest, trends: FashionTrend[], items: ShoppableItem[]): string {
        const trendsSummary = trends.slice(0, 5).map(t => `- ${t.name}: ${t.description}`).join('\n');
        const itemsSummary = this.summarizeItems(items);

        return `
Genera un outfit completo basado en esta solicitud:

**Solicitud del usuario:**
- Estilo: ${request.style || 'trending'}
- Ocasión: ${request.occasion || 'everyday'}
- Temporada: ${request.season || 'winter'}
- Colores preferidos: ${request.preferredColors?.join(', ') || 'cualquiera'}
- Marcas preferidas: ${request.preferredBrands?.join(', ') || 'cualquiera'}
- Rango de precio: ${request.priceRange || 'cualquiera'}
${request.mood ? `- Mood: ${request.mood}` : ''}
${request.description ? `- Descripción adicional: ${request.description}` : ''}

**Tendencias actuales:**
${trendsSummary}

**Items disponibles en el catálogo:**
${itemsSummary}

**Responde en JSON con este formato exacto:**
{
  "name": "Nombre creativo del outfit (en español)",
  "description": "Descripción del outfit y por qué funciona (en español)",
  "style": "estilo principal",
  "reasoning": "Explicación de las decisiones de estilo (en español)",
  "items": [
    {
      "type": "top/bottom/shoes/outerwear/bag/accessory/dress",
      "attributes": ["atributos clave como color, material, estilo"],
      "priority": 1-10
    }
  ],
  "colorPalette": ["colores principales del outfit"],
  "trends": ["nombres de tendencias que incorpora"]
}

Asegúrate de que el outfit sea coherente, trendy, y que los items combinen bien entre sí.
`;
    }

    private summarizeItems(items: ShoppableItem[]): string {
        const byType: Record<string, ShoppableItem[]> = {};

        for (const item of items) {
            if (!byType[item.type]) byType[item.type] = [];
            byType[item.type].push(item);
        }

        let summary = '';
        for (const [type, typeItems] of Object.entries(byType)) {
            const sample = typeItems.slice(0, 3).map(i =>
                `${i.name} (${i.brand}) - ${i.price || 'N/A'}`
            ).join(', ');
            summary += `- ${type}: ${sample}\n`;
        }

        return summary;
    }

    private buildOutfitFromAI(
        aiSuggestion: AIOutfitSuggestion,
        request: OutfitRequest,
        availableItems: ShoppableItem[]
    ): GeneratedOutfit {
        const outfitItems: OutfitItem[] = [];

        // Match AI suggestions with actual items
        for (const suggestion of aiSuggestion.items) {
            const matchedItem = this.findBestMatch(suggestion, availableItems);

            if (matchedItem) {
                outfitItems.push({
                    id: matchedItem.id,
                    name: matchedItem.name,
                    brand: matchedItem.brand,
                    type: matchedItem.type,
                    color: matchedItem.color,
                    colorHex: matchedItem.colorHex,
                    imageUrl: matchedItem.imageUrl,
                    buyLink: matchedItem.buyLink,
                    price: matchedItem.price,
                    priceRange: matchedItem.priceRange,
                    source: matchedItem.source,
                    trending: matchedItem.trending,
                    matchScore: suggestion.priority * 10,
                });
            }
        }

        const trendingScore = Math.round(
            (outfitItems.filter(i => i.trending).length / outfitItems.length) * 100
        );

        return this.dataStore.addOutfit({
            name: aiSuggestion.name,
            style: aiSuggestion.style || request.style || 'trending',
            occasion: request.occasion || 'everyday',
            season: request.season || 'winter',
            description: aiSuggestion.description,
            items: outfitItems,
            totalItems: outfitItems.length,
            trendingScore,
            estimatedPrice: this.estimatePrice(outfitItems),
            priceRange: this.calculatePriceRange(outfitItems),
            matchedTrends: aiSuggestion.trends,
            aiGenerated: true,
            aiPrompt: request.description,
            aiReasoning: aiSuggestion.reasoning,
        });
    }

    private findBestMatch(
        suggestion: { type: string; attributes: string[]; priority: number },
        items: ShoppableItem[]
    ): ShoppableItem | null {
        const typeItems = items.filter(i => i.type === suggestion.type);

        if (typeItems.length === 0) {
            // Try finding any item that matches attributes
            const anyMatch = items.find(item => {
                const itemText = `${item.name} ${item.description || ''} ${item.color || ''}`.toLowerCase();
                return suggestion.attributes.some(attr => itemText.includes(attr.toLowerCase()));
            });
            return anyMatch || null;
        }

        // Score each item by matching attributes
        let bestMatch: ShoppableItem | null = null;
        let bestScore = 0;

        for (const item of typeItems) {
            const itemText = `${item.name} ${item.description || ''} ${item.color || ''} ${item.brand}`.toLowerCase();
            let score = 0;

            for (const attr of suggestion.attributes) {
                if (itemText.includes(attr.toLowerCase())) {
                    score += 10;
                }
            }

            if (item.trending) score += 15;
            if (item.imageUrl) score += 5;

            if (score > bestScore) {
                bestScore = score;
                bestMatch = item;
            }
        }

        // If no good match, return random from type
        return bestMatch || typeItems[Math.floor(Math.random() * typeItems.length)];
    }

    // ==================== FALLBACK GENERATION ====================

    private generateWithFallback(request: OutfitRequest): GeneratedOutfit {
        logger.info('📦 Using fallback generation');

        const items = this.dataStore.getItems();
        const trends = this.dataStore.getTopTrends(5);

        const outfitItems: OutfitItem[] = [];
        const usedIds = new Set<string>();

        // Select items by type
        const requiredTypes = ['top', 'bottom', 'shoes'];
        const optionalTypes = ['bag', 'outerwear', 'accessory'];

        // Get required items
        for (const type of requiredTypes) {
            const typeItems = items.filter(i => i.type === type && !usedIds.has(i.id));
            if (typeItems.length > 0) {
                const selected = typeItems[Math.floor(Math.random() * Math.min(3, typeItems.length))];
                usedIds.add(selected.id);
                outfitItems.push(this.itemToOutfitItem(selected, 80));
            }
        }

        // Maybe add optional items
        for (const type of optionalTypes) {
            if (Math.random() > 0.4) {
                const typeItems = items.filter(i => i.type === type && !usedIds.has(i.id));
                if (typeItems.length > 0) {
                    const selected = typeItems[Math.floor(Math.random() * Math.min(3, typeItems.length))];
                    usedIds.add(selected.id);
                    outfitItems.push(this.itemToOutfitItem(selected, 70));
                }
            }
        }

        const trendingScore = Math.round(
            (outfitItems.filter(i => i.trending).length / outfitItems.length) * 100
        );

        const names = [
            'Look del Día', 'Estilo Urbano', 'Elegancia Casual',
            'Trendy Vibes', 'Street Chic', 'Modern Classic'
        ];

        return this.dataStore.addOutfit({
            name: names[Math.floor(Math.random() * names.length)],
            style: request.style || 'casual',
            occasion: request.occasion || 'everyday',
            season: request.season || 'winter',
            description: `Outfit generado automáticamente basado en las tendencias actuales.`,
            items: outfitItems,
            totalItems: outfitItems.length,
            trendingScore,
            estimatedPrice: this.estimatePrice(outfitItems),
            priceRange: this.calculatePriceRange(outfitItems),
            matchedTrends: trends.slice(0, 2).map(t => t.name),
            aiGenerated: false,
        });
    }

    private itemToOutfitItem(item: ShoppableItem, matchScore: number): OutfitItem {
        return {
            id: item.id,
            name: item.name,
            brand: item.brand,
            type: item.type,
            color: item.color,
            colorHex: item.colorHex,
            imageUrl: item.imageUrl,
            buyLink: item.buyLink,
            price: item.price,
            priceRange: item.priceRange,
            source: item.source,
            trending: item.trending,
            matchScore,
        };
    }

    // ==================== UTILITIES ====================

    private estimatePrice(items: OutfitItem[]): string {
        const ranges: Record<string, [number, number]> = {
            budget: [20, 50],
            mid: [50, 150],
            premium: [150, 400],
            luxury: [400, 2000],
        };

        let min = 0;
        let max = 0;

        for (const item of items) {
            const range = ranges[item.priceRange || 'mid'];
            min += range[0];
            max += range[1];
        }

        return `${min}-${max}€`;
    }

    private calculatePriceRange(items: OutfitItem[]): string {
        const ranges = items.map(i => i.priceRange || 'mid');
        const rangeValues = { budget: 1, mid: 2, premium: 3, luxury: 4 };
        const avg = ranges.reduce((sum, r) => sum + (rangeValues[r as keyof typeof rangeValues] || 2), 0) / ranges.length;

        if (avg <= 1.5) return 'Budget';
        if (avg <= 2.5) return 'Mid-Range';
        if (avg <= 3.5) return 'Premium';
        return 'Luxury';
    }

    // ==================== ADVANCED GENERATION ====================

    async generateMultipleOutfits(request: OutfitRequest, count: number = 3): Promise<GeneratedOutfit[]> {
        const outfits: GeneratedOutfit[] = [];

        for (let i = 0; i < count; i++) {
            const outfit = await this.generateOutfit({
                ...request,
                mood: `${request.mood || ''} variation ${i + 1}`.trim(),
            });
            outfits.push(outfit);
        }

        return outfits;
    }

    async generateFromDescription(description: string): Promise<GeneratedOutfit> {
        return this.generateOutfit({
            description,
            style: 'trending',
        });
    }

    async suggestImprovements(outfitId: string): Promise<string[]> {
        const outfit = this.dataStore.getOutfits().find(o => o.id === outfitId);
        if (!outfit) return [];

        // Simple suggestions based on outfit analysis
        const suggestions: string[] = [];

        if (outfit.items.length < 4) {
            suggestions.push('Añade un accesorio para completar el look');
        }

        const hasShoes = outfit.items.some(i => i.type === 'shoes');
        if (!hasShoes) {
            suggestions.push('Considera añadir calzado que complemente el outfit');
        }

        const hasBag = outfit.items.some(i => i.type === 'bag');
        if (!hasBag) {
            suggestions.push('Un bolso puede elevar el look');
        }

        if (outfit.trendingScore < 50) {
            suggestions.push('Incorpora alguna pieza trending para actualizar el look');
        }

        return suggestions;
    }

    // ==================== STATUS ====================

    getStatus() {
        return {
            isConfigured: this.isConfigured,
            model: 'gpt-4o-mini',
            capabilities: [
                'outfit-generation',
                'trend-analysis',
                'style-matching',
                'description-based-generation',
            ],
        };
    }
}
