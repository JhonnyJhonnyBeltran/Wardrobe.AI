/**
 * AI-powered Fashion Data Extractor for Klozet
 * Uses OpenAI to extract structured fashion data from articles
 */

import { AIExtractionResult, TrendCategory, ItemType, PriceRange } from './types';

const EXTRACTION_PROMPT = `You are a fashion data extraction assistant. Analyze the following fashion article and extract structured data.

Return a JSON object with this exact structure:
{
  "trends": [
    {
      "name": "Trend name (e.g., 'Cherry Red', 'Oversized Blazers')",
      "category": "color" | "garment" | "style" | "accessory" | "pattern",
      "description": "Brief description of the trend (max 100 chars)"
    }
  ],
  "items": [
    {
      "name": "Full item name (e.g., 'R13 Jane Jeans')",
      "brand": "Brand name",
      "type": "top" | "bottom" | "shoes" | "accessory" | "outerwear" | "dress" | "bag",
      "description": "Brief description (max 80 chars)",
      "color": "Main color if mentioned",
      "priceRange": "budget" | "mid" | "premium" | "luxury"
    }
  ],
  "season": "Season mentioned (e.g., 'Winter 2025', 'SS26')"
}

Rules:
- Only extract real, specific items with brand names
- Use the exact brand name spelling mentioned in the text
- Estimate priceRange based on brand: Zara/H&M = budget, Reformation = mid, Jacquemus = premium, Chanel/Gucci = luxury
- If no specific season is mentioned, return null for season
- Limit to max 5 trends and 10 items
- Skip generic mentions without brand names`;

/**
 * Extract fashion data using OpenAI
 */
export async function extractWithAI(
    articleContent: string,
    apiKey?: string
): Promise<AIExtractionResult | null> {
    const key = apiKey || process.env.OPENAI_API_KEY;

    if (!key) {
        console.warn('OpenAI API key not configured, skipping AI extraction');
        return null;
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: EXTRACTION_PROMPT,
                    },
                    {
                        role: 'user',
                        content: `Article content:\n\n${articleContent.slice(0, 4000)}`, // Limit content
                    },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.3,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error('Empty response from OpenAI');
        }

        const result = JSON.parse(content) as AIExtractionResult;

        // Validate and clean the result
        return {
            trends: (result.trends || []).slice(0, 5).map(t => ({
                name: t.name,
                category: validateCategory(t.category),
                description: t.description?.slice(0, 100) || '',
            })),
            items: (result.items || []).slice(0, 10).map(i => ({
                name: i.name,
                brand: i.brand,
                type: validateItemType(i.type),
                description: i.description?.slice(0, 80) || '',
                color: i.color,
                priceRange: validatePriceRange(i.priceRange),
            })),
            season: result.season || undefined,
        };
    } catch (error) {
        console.error('AI extraction error:', error);
        return null;
    }
}

function validateCategory(cat: string): TrendCategory {
    const valid: TrendCategory[] = ['color', 'garment', 'style', 'accessory', 'pattern'];
    return valid.includes(cat as TrendCategory) ? (cat as TrendCategory) : 'garment';
}

function validateItemType(type: string): ItemType {
    const valid: ItemType[] = ['top', 'bottom', 'shoes', 'accessory', 'outerwear', 'dress', 'bag'];
    return valid.includes(type as ItemType) ? (type as ItemType) : 'top';
}

function validatePriceRange(range?: string): PriceRange | undefined {
    const valid: PriceRange[] = ['budget', 'mid', 'premium', 'luxury'];
    return range && valid.includes(range as PriceRange) ? (range as PriceRange) : undefined;
}

/**
 * Batch extract from multiple articles
 */
export async function batchExtract(
    articles: Array<{ title: string; content: string }>,
    apiKey?: string
): Promise<AIExtractionResult[]> {
    const results: AIExtractionResult[] = [];

    // Process sequentially to respect rate limits
    for (const article of articles) {
        const fullContent = `${article.title}\n\n${article.content}`;
        const result = await extractWithAI(fullContent, apiKey);

        if (result) {
            results.push(result);
        }

        // Rate limiting: wait 500ms between requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    return results;
}
