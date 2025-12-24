/**
 * Fashion RSS Scraper for Klozet
 * Fetches and parses fashion RSS feeds from ELLE, WhoWhatWear, etc.
 */

import { RSSFeedItem, FASHION_SOURCES, FashionSourceConfig } from './types';

// Simple XML to JSON parser (works in Node.js/edge)
function parseXML(xmlText: string): RSSFeedItem[] {
    const items: RSSFeedItem[] = [];

    // Extract items using regex (lightweight, no dependencies)
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null) {
        const itemXml = match[1];

        const title = extractTag(itemXml, 'title');
        const link = extractTag(itemXml, 'link');
        const description = extractTag(itemXml, 'description');
        const pubDate = extractTag(itemXml, 'pubDate');
        const imageUrl = extractMediaContent(itemXml) || extractTag(itemXml, 'enclosure', 'url');

        if (title && link) {
            items.push({
                title: cleanCDATA(title),
                link,
                description: cleanCDATA(description || ''),
                pubDate: pubDate || new Date().toISOString(),
                imageUrl: imageUrl || undefined,
                source: '', // Will be set by caller
            });
        }
    }

    return items;
}

function extractTag(xml: string, tagName: string, attribute?: string): string | null {
    if (attribute) {
        const regex = new RegExp(`<${tagName}[^>]*${attribute}="([^"]*)"`, 'i');
        const match = xml.match(regex);
        return match ? match[1] : null;
    }

    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : null;
}

function extractMediaContent(xml: string): string | null {
    const mediaRegex = /<media:content[^>]*url="([^"]*)"[^>]*>/i;
    const match = xml.match(mediaRegex);
    return match ? match[1] : null;
}

function cleanCDATA(text: string): string {
    return text
        .replace(/<!\[CDATA\[/g, '')
        .replace(/\]\]>/g, '')
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .trim();
}

/**
 * Fetch RSS feed from a fashion source
 */
export async function fetchRSSFeed(source: FashionSourceConfig): Promise<RSSFeedItem[]> {
    try {
        const response = await fetch(source.url, {
            headers: {
                'User-Agent': 'Klozet Fashion App/1.0',
                'Accept': 'application/rss+xml, application/xml, text/xml',
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            console.error(`Failed to fetch ${source.name}: ${response.status}`);
            return [];
        }

        const xmlText = await response.text();
        const items = parseXML(xmlText);

        // Add source to each item
        return items.map(item => ({
            ...item,
            source: source.name,
        }));
    } catch (error) {
        console.error(`Error fetching ${source.name}:`, error);
        return [];
    }
}

/**
 * Fetch all enabled fashion RSS feeds
 */
export async function fetchAllFeeds(): Promise<RSSFeedItem[]> {
    const enabledSources = FASHION_SOURCES.filter(s => s.enabled);

    const results = await Promise.allSettled(
        enabledSources.map(source => fetchRSSFeed(source))
    );

    const allItems: RSSFeedItem[] = [];

    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            allItems.push(...result.value);
        } else {
            console.error(`Failed to fetch ${enabledSources[index].name}:`, result.reason);
        }
    });

    // Sort by date (newest first)
    allItems.sort((a, b) =>
        new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    return allItems;
}

/**
 * Get recent fashion articles (last 7 days)
 */
export async function getRecentArticles(daysBack: number = 7): Promise<RSSFeedItem[]> {
    const allItems = await fetchAllFeeds();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    return allItems.filter(item =>
        new Date(item.pubDate) >= cutoffDate
    );
}
