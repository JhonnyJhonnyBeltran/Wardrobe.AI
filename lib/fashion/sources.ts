/**
 * 📰 Fashion Sources Configuration
 * Comprehensive list of fashion magazines and websites for scraping
 */

export type SourceType = 'rss' | 'web' | 'api';
export type ScrapingFrequency = 'daily' | 'weekly' | 'monthly';
export type SourceRegion = 'international' | 'spain' | 'usa' | 'uk' | 'france' | 'italy';

export interface FashionSource {
    id: string;
    name: string;
    url: string;
    type: SourceType;
    enabled: boolean;
    frequency: ScrapingFrequency;
    region: SourceRegion;
    category: 'magazine' | 'blog' | 'retailer' | 'trends';
    selectors?: WebSelectors; // For web scraping
    rssUrl?: string;          // For RSS feeds
    apiEndpoint?: string;     // For APIs
    lastScraped?: string;
    priority: number;         // 1-10, higher = more important
}

export interface WebSelectors {
    articleList: string;
    articleTitle?: string;     // Optional for retailers
    articleLink?: string;      // Optional for retailers
    articleImage?: string;
    articleDescription?: string;
    articleDate?: string;
    productName?: string;
    productBrand?: string;
    productPrice?: string;
    productImage?: string;
    productLink?: string;
    pagination?: string;
}

// ==================== FASHION MAGAZINES (RSS) ====================

export const RSS_SOURCES: FashionSource[] = [
    // International Magazines
    {
        id: 'elle-usa',
        name: 'ELLE USA',
        url: 'https://www.elle.com',
        rssUrl: 'https://www.elle.com/rss/fashion.xml',
        type: 'rss',
        enabled: true,
        frequency: 'daily',
        region: 'usa',
        category: 'magazine',
        priority: 10,
    },
    {
        id: 'whowhatwear',
        name: 'WhoWhatWear',
        url: 'https://www.whowhatwear.com',
        rssUrl: 'https://www.whowhatwear.com/rss',
        type: 'rss',
        enabled: true,
        frequency: 'daily',
        region: 'international',
        category: 'blog',
        priority: 9,
    },
    {
        id: 'harpersbazaar',
        name: "Harper's Bazaar",
        url: 'https://www.harpersbazaar.com',
        rssUrl: 'https://www.harpersbazaar.com/rss/fashion.xml',
        type: 'rss',
        enabled: true,
        frequency: 'daily',
        region: 'usa',
        category: 'magazine',
        priority: 9,
    },
    {
        id: 'vogue-usa',
        name: 'Vogue USA',
        url: 'https://www.vogue.com',
        rssUrl: 'https://www.vogue.com/feed/rss',
        type: 'rss',
        enabled: true,
        frequency: 'daily',
        region: 'usa',
        category: 'magazine',
        priority: 10,
    },
    {
        id: 'refinery29',
        name: 'Refinery29',
        url: 'https://www.refinery29.com',
        rssUrl: 'https://www.refinery29.com/rss.xml',
        type: 'rss',
        enabled: true,
        frequency: 'daily',
        region: 'usa',
        category: 'blog',
        priority: 8,
    },
    {
        id: 'glamour',
        name: 'Glamour',
        url: 'https://www.glamour.com',
        rssUrl: 'https://www.glamour.com/feed/rss',
        type: 'rss',
        enabled: true,
        frequency: 'daily',
        region: 'usa',
        category: 'magazine',
        priority: 8,
    },
    {
        id: 'instyle',
        name: 'InStyle',
        url: 'https://www.instyle.com',
        rssUrl: 'https://www.instyle.com/feeds/all',
        type: 'rss',
        enabled: true,
        frequency: 'daily',
        region: 'usa',
        category: 'magazine',
        priority: 8,
    },
];

// ==================== WEB SCRAPING SOURCES ====================

export const WEB_SOURCES: FashionSource[] = [
    // Spanish Sources
    {
        id: 'elle-spain',
        name: 'ELLE España',
        url: 'https://www.elle.com/es/moda/tendencias/',
        type: 'web',
        enabled: true,
        frequency: 'weekly',
        region: 'spain',
        category: 'magazine',
        priority: 9,
        selectors: {
            articleList: 'article.full-item, .content-list-item',
            articleTitle: 'h2, .full-item-title',
            articleLink: 'a.full-item-link, a[href*="/moda/"]',
            articleImage: 'img.lazyload, img[data-src]',
            articleDescription: '.dek, .item-description',
        },
    },
    {
        id: 'vogue-spain',
        name: 'Vogue España',
        url: 'https://www.vogue.es/moda/tendencias',
        type: 'web',
        enabled: true,
        frequency: 'weekly',
        region: 'spain',
        category: 'magazine',
        priority: 10,
        selectors: {
            articleList: '.summary-item, article.card',
            articleTitle: '.summary-item__hed, h2, h3',
            articleLink: 'a.summary-item__hed-link, a[href*="/moda/"]',
            articleImage: 'img.responsive-image__image, picture img',
            articleDescription: '.summary-item__dek',
        },
    },
    {
        id: 'glamour-spain',
        name: 'Glamour España',
        url: 'https://www.glamour.es/moda',
        type: 'web',
        enabled: true,
        frequency: 'weekly',
        region: 'spain',
        category: 'magazine',
        priority: 8,
        selectors: {
            articleList: '.summary-item, article',
            articleTitle: 'h2, h3',
            articleLink: 'a[href*="/moda/"]',
            articleImage: 'img',
            articleDescription: '.summary-item__dek, p',
        },
    },
    {
        id: 'woman-es',
        name: 'Woman Madame Figaro',
        url: 'https://www.woman.es/moda',
        type: 'web',
        enabled: true,
        frequency: 'weekly',
        region: 'spain',
        category: 'magazine',
        priority: 7,
        selectors: {
            articleList: '.article-item, article',
            articleTitle: 'h2, h3',
            articleLink: 'a[href*="/moda"]',
            articleImage: 'img',
            articleDescription: '.excerpt',
        },
    },
    {
        id: 'telva',
        name: 'Telva',
        url: 'https://www.telva.com/moda/',
        type: 'web',
        enabled: true,
        frequency: 'weekly',
        region: 'spain',
        category: 'magazine',
        priority: 7,
        selectors: {
            articleList: '.article, .noticia',
            articleTitle: 'h2, h3, .titulo',
            articleLink: 'a[href*="/moda/"]',
            articleImage: 'img',
            articleDescription: '.entradilla',
        },
    },
    // French Sources
    {
        id: 'elle-france',
        name: 'ELLE France',
        url: 'https://www.elle.fr/Mode',
        type: 'web',
        enabled: true,
        frequency: 'weekly',
        region: 'france',
        category: 'magazine',
        priority: 8,
        selectors: {
            articleList: '.article-item, article',
            articleTitle: 'h2, h3',
            articleLink: 'a[href*="/Mode/"]',
            articleImage: 'img',
            articleDescription: '.excerpt',
        },
    },
    {
        id: 'vogue-france',
        name: 'Vogue France',
        url: 'https://www.vogue.fr/mode',
        type: 'web',
        enabled: true,
        frequency: 'weekly',
        region: 'france',
        category: 'magazine',
        priority: 9,
        selectors: {
            articleList: '.summary-item, article',
            articleTitle: 'h2, h3',
            articleLink: 'a[href*="/mode/"]',
            articleImage: 'img',
            articleDescription: '.summary-item__dek',
        },
    },
    // UK Sources
    {
        id: 'vogue-uk',
        name: 'Vogue UK',
        url: 'https://www.vogue.co.uk/fashion',
        type: 'web',
        enabled: true,
        frequency: 'weekly',
        region: 'uk',
        category: 'magazine',
        priority: 9,
        selectors: {
            articleList: '.summary-item, article.card',
            articleTitle: 'h2, h3',
            articleLink: 'a[href*="/fashion/"]',
            articleImage: 'img',
            articleDescription: '.summary-item__dek',
        },
    },
    // Italian Sources
    {
        id: 'vogue-italy',
        name: 'Vogue Italia',
        url: 'https://www.vogue.it/moda',
        type: 'web',
        enabled: true,
        frequency: 'weekly',
        region: 'italy',
        category: 'magazine',
        priority: 9,
        selectors: {
            articleList: '.summary-item, article',
            articleTitle: 'h2, h3',
            articleLink: 'a[href*="/moda/"]',
            articleImage: 'img',
            articleDescription: '.summary-item__dek',
        },
    },
];

// ==================== TREND DATA SOURCES ====================

export const TREND_SOURCES: FashionSource[] = [
    {
        id: 'lyst-index',
        name: 'Lyst Index',
        url: 'https://www.lyst.com/data/the-lyst-index/',
        type: 'web',
        enabled: true,
        frequency: 'monthly',
        region: 'international',
        category: 'trends',
        priority: 10,
        selectors: {
            articleList: '.product-card, .brand-card',
            articleTitle: '.product-name, .brand-name',
            articleLink: 'a',
            articleImage: 'img',
            productBrand: '.brand-name',
        },
    },
    {
        id: 'google-trends-fashion',
        name: 'Google Trends - Fashion',
        url: 'https://trends.google.com/trends/explore?cat=185&geo=ES',
        type: 'api',
        apiEndpoint: 'https://trends.google.com/trends/api/dailytrends',
        enabled: false, // Requires API key
        frequency: 'weekly',
        region: 'spain',
        category: 'trends',
        priority: 8,
    },
    {
        id: 'pinterest-trends',
        name: 'Pinterest Trends',
        url: 'https://trends.pinterest.com/',
        type: 'web',
        enabled: false, // Requires login
        frequency: 'weekly',
        region: 'international',
        category: 'trends',
        priority: 9,
        selectors: {
            articleList: '.trend-card',
            articleTitle: '.trend-name',
            articleLink: 'a',
            articleImage: 'img',
        },
    },
];

// ==================== RETAILER SOURCES ====================

export const RETAILER_SOURCES: FashionSource[] = [
    {
        id: 'zara-new',
        name: 'Zara - Novedades',
        url: 'https://www.zara.com/es/es/mujer-novedades-l1180.html',
        type: 'web',
        enabled: true,
        frequency: 'weekly',
        region: 'spain',
        category: 'retailer',
        priority: 8,
        selectors: {
            articleList: '.product-grid__product-list .product-grid-product',
            productName: '.product-grid-product__name',
            productPrice: '.money-amount__main',
            productLink: 'a.product-link',
            productImage: 'img.media-image__image',
        },
    },
    {
        id: 'mango-new',
        name: 'Mango - Novedades',
        url: 'https://shop.mango.com/es/mujer/featured/novedades_d65965066',
        type: 'web',
        enabled: true,
        frequency: 'weekly',
        region: 'spain',
        category: 'retailer',
        priority: 7,
        selectors: {
            articleList: '.product-list-row .product',
            productName: '.product-name',
            productPrice: '.price',
            productLink: 'a.product-link',
            productImage: 'img.product-image',
        },
    },
    {
        id: 'hm-new',
        name: 'H&M - Novedades',
        url: 'https://www2.hm.com/es_es/mujer/nuevo-esta-semana/ver-todo.html',
        type: 'web',
        enabled: true,
        frequency: 'weekly',
        region: 'spain',
        category: 'retailer',
        priority: 7,
        selectors: {
            articleList: '.product-item',
            productName: '.item-heading a',
            productPrice: '.item-price span',
            productLink: 'a.item-link',
            productImage: 'img.item-image',
        },
    },
];

// ==================== ALL SOURCES COMBINED ====================

export const ALL_FASHION_SOURCES: FashionSource[] = [
    ...RSS_SOURCES,
    ...WEB_SOURCES,
    ...TREND_SOURCES,
    ...RETAILER_SOURCES,
];

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get sources by type
 */
export function getSourcesByType(type: SourceType): FashionSource[] {
    return ALL_FASHION_SOURCES.filter(s => s.type === type && s.enabled);
}

/**
 * Get sources by frequency
 */
export function getSourcesByFrequency(frequency: ScrapingFrequency): FashionSource[] {
    return ALL_FASHION_SOURCES.filter(s => s.frequency === frequency && s.enabled);
}

/**
 * Get sources by region
 */
export function getSourcesByRegion(region: SourceRegion): FashionSource[] {
    return ALL_FASHION_SOURCES.filter(s => s.region === region && s.enabled);
}

/**
 * Get sources sorted by priority
 */
export function getSourcesByPriority(): FashionSource[] {
    return ALL_FASHION_SOURCES
        .filter(s => s.enabled)
        .sort((a, b) => b.priority - a.priority);
}

/**
 * Get sources that need updating based on last scraped time
 */
export function getSourcesNeedingUpdate(sources: FashionSource[]): FashionSource[] {
    const now = Date.now();

    return sources.filter(source => {
        if (!source.lastScraped) return true;

        const lastScrapedTime = new Date(source.lastScraped).getTime();
        const timeDiff = now - lastScrapedTime;

        const intervals = {
            daily: 24 * 60 * 60 * 1000,      // 24 hours
            weekly: 7 * 24 * 60 * 60 * 1000,  // 7 days
            monthly: 30 * 24 * 60 * 60 * 1000, // 30 days
        };

        return timeDiff >= intervals[source.frequency];
    });
}
