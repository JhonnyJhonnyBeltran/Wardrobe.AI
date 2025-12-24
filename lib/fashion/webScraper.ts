/**
 * 🌐 Web Scraper for Fashion Sources
 * Scrapes web pages that don't have RSS feeds
 */

import { FashionSource, WebSelectors } from './sources';
import { RSSFeedItem } from './types';

/**
 * User agents to rotate for avoiding blocks
 */
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
];

/**
 * Get random user agent
 */
function getRandomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Rate limiter - ensures we don't make too many requests
 */
class RateLimiter {
    private lastRequest: number = 0;
    private minInterval: number;

    constructor(requestsPerSecond: number = 1) {
        this.minInterval = 1000 / requestsPerSecond;
    }

    async wait(): Promise<void> {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequest;

        if (timeSinceLastRequest < this.minInterval) {
            await new Promise(resolve =>
                setTimeout(resolve, this.minInterval - timeSinceLastRequest)
            );
        }

        this.lastRequest = Date.now();
    }
}

const rateLimiter = new RateLimiter(0.5); // 1 request per 2 seconds

/**
 * Fetch HTML content from a URL
 */
export async function fetchHTML(url: string): Promise<string | null> {
    await rateLimiter.wait();

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(url, {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Cache-Control': 'no-cache',
            },
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
            console.error(`HTTP ${response.status} for ${url}`);
            return null;
        }

        return await response.text();
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.error(`Timeout fetching ${url}`);
        } else {
            console.error(`Error fetching ${url}:`, error);
        }
        return null;
    }
}

/**
 * Simple HTML parser using regex (no DOM library needed)
 * Note: For production, consider using cheerio or similar
 */
function extractBySelector(html: string, selector: string): string[] {
    const results: string[] = [];

    // Parse simple selectors (class, tag, attribute)
    const parts = selector.split(',').map(s => s.trim());

    for (const part of parts) {
        let pattern: RegExp | null = null;

        if (part.startsWith('.')) {
            // Class selector: .class-name
            const className = part.slice(1);
            pattern = new RegExp(`<[^>]+class="[^"]*\\b${className}\\b[^"]*"[^>]*>([\\s\\S]*?)<\\/`, 'gi');
        } else if (part.startsWith('a[href*="')) {
            // Attribute contains selector: a[href*="pattern"]
            const match = part.match(/a\[href\*="([^"]+)"\]/);
            if (match) {
                const urlPattern = match[1];
                pattern = new RegExp(`<a[^>]+href="([^"]*${urlPattern}[^"]*)"[^>]*>`, 'gi');
            }
        } else if (part.startsWith('img')) {
            // Image selector
            pattern = /<img[^>]+src="([^"]+)"[^>]*>/gi;
        } else if (part.match(/^h[1-6]$/)) {
            // Heading selector
            pattern = new RegExp(`<${part}[^>]*>([\\s\\S]*?)<\\/${part}>`, 'gi');
        } else {
            // Generic tag selector
            pattern = new RegExp(`<${part}[^>]*>([\\s\\S]*?)<\\/${part}>`, 'gi');
        }

        if (pattern) {
            let match;
            while ((match = pattern.exec(html)) !== null) {
                const content = match[1]?.trim();
                if (content && content.length > 0 && content.length < 1000) {
                    results.push(cleanHTML(content));
                }
            }
        }
    }

    return [...new Set(results)]; // Remove duplicates
}

/**
 * Extract links from HTML
 */
function extractLinks(html: string, baseUrl: string, pattern?: string): string[] {
    const links: string[] = [];
    const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>/gi;

    let match;
    while ((match = linkRegex.exec(html)) !== null) {
        let href = match[1];

        // Skip anchors, javascript, and mailto
        if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
            continue;
        }

        // Convert relative URLs to absolute
        if (href.startsWith('/')) {
            const url = new URL(baseUrl);
            href = `${url.protocol}//${url.host}${href}`;
        } else if (!href.startsWith('http')) {
            href = new URL(href, baseUrl).href;
        }

        // Filter by pattern if provided
        if (pattern && !href.includes(pattern)) {
            continue;
        }

        links.push(href);
    }

    return [...new Set(links)].slice(0, 20); // Limit to 20 links
}

/**
 * Extract images from HTML
 */
function extractImages(html: string, baseUrl: string): string[] {
    const images: string[] = [];

    // Regular img src
    const imgRegex = /<img[^>]+(?:src|data-src)="([^"]+)"[^>]*>/gi;
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
        let src = match[1];

        // Skip data URIs and tiny images
        if (src.startsWith('data:') || src.includes('1x1') || src.includes('pixel')) {
            continue;
        }

        // Convert relative URLs
        if (src.startsWith('/')) {
            const url = new URL(baseUrl);
            src = `${url.protocol}//${url.host}${src}`;
        } else if (!src.startsWith('http')) {
            src = new URL(src, baseUrl).href;
        }

        images.push(src);
    }

    return [...new Set(images)].slice(0, 10);
}

/**
 * Clean HTML tags from text
 */
function cleanHTML(text: string): string {
    return text
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#\d+;/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Parse articles from HTML using selectors
 */
function parseArticles(html: string, baseUrl: string, selectors: WebSelectors): RSSFeedItem[] {
    const articles: RSSFeedItem[] = [];

    // Extract all links that might be article links
    const pattern = selectors.articleLink?.match(/\[href\*="([^"]+)"\]/)?.[1];
    const links = extractLinks(html, baseUrl, pattern || '/moda/');

    // Extract titles
    const titles = selectors.articleTitle
        ? extractBySelector(html, selectors.articleTitle)
        : [];

    // Extract descriptions
    const descriptions = selectors.articleDescription
        ? extractBySelector(html, selectors.articleDescription)
        : [];

    // Extract images
    const images = extractImages(html, baseUrl);

    // Combine data
    const maxItems = Math.min(links.length, titles.length || links.length, 15);

    for (let i = 0; i < maxItems; i++) {
        const title = titles[i] || `Article ${i + 1}`;
        const link = links[i];

        if (!link || !title || title.length < 5) continue;

        articles.push({
            title,
            link,
            description: descriptions[i] || '',
            pubDate: new Date().toISOString(),
            imageUrl: images[i],
            source: '',
        });
    }

    return articles;
}

/**
 * Scrape a web source
 */
export async function scrapeWebSource(source: FashionSource): Promise<RSSFeedItem[]> {
    if (source.type !== 'web' || !source.selectors) {
        console.error(`Invalid web source: ${source.id}`);
        return [];
    }

    console.log(`🌐 Scraping: ${source.name} (${source.url})`);

    const html = await fetchHTML(source.url);
    if (!html) {
        console.error(`Failed to fetch HTML for ${source.name}`);
        return [];
    }

    const articles = parseArticles(html, source.url, source.selectors);

    // Add source name to each article
    return articles.map(article => ({
        ...article,
        source: source.name,
    }));
}

/**
 * Scrape multiple web sources
 */
export async function scrapeWebSources(sources: FashionSource[]): Promise<RSSFeedItem[]> {
    const webSources = sources.filter(s => s.type === 'web' && s.enabled);
    const allArticles: RSSFeedItem[] = [];

    for (const source of webSources) {
        try {
            const articles = await scrapeWebSource(source);
            allArticles.push(...articles);
            console.log(`  ✅ ${source.name}: ${articles.length} articles`);
        } catch (error) {
            console.error(`  ❌ ${source.name}:`, error);
        }
    }

    return allArticles;
}

/**
 * Scrape product data from retailer pages
 */
export interface ScrapedProduct {
    name: string;
    brand: string;
    price?: string;
    imageUrl?: string;
    productUrl: string;
    source: string;
}

export async function scrapeRetailerProducts(source: FashionSource): Promise<ScrapedProduct[]> {
    if (source.category !== 'retailer' || !source.selectors) {
        return [];
    }

    console.log(`🛍️ Scraping products: ${source.name}`);

    const html = await fetchHTML(source.url);
    if (!html) return [];

    const products: ScrapedProduct[] = [];
    const { selectors } = source;

    // Extract product data
    const names = selectors.productName
        ? extractBySelector(html, selectors.productName)
        : [];
    const prices = selectors.productPrice
        ? extractBySelector(html, selectors.productPrice)
        : [];
    const images = extractImages(html, source.url);
    const links = extractLinks(html, source.url);

    // Derive brand from source name
    const brandMap: Record<string, string> = {
        'zara-new': 'Zara',
        'mango-new': 'Mango',
        'hm-new': 'H&M',
    };
    const brand = brandMap[source.id] || source.name.split(' ')[0];

    const maxItems = Math.min(names.length, 20);

    for (let i = 0; i < maxItems; i++) {
        if (!names[i] || names[i].length < 3) continue;

        products.push({
            name: names[i],
            brand,
            price: prices[i],
            imageUrl: images[i],
            productUrl: links[i] || source.url,
            source: source.name,
        });
    }

    console.log(`  📦 Found ${products.length} products`);
    return products;
}
