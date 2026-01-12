import { NextResponse } from 'next/server';
import { fetchHTML } from '@/lib/fashion/webScraper';

// Helper function to wait
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Extract Zara product images from URL patterns
function extractZaraImages(url: string, html: string): string[] {
    const images: string[] = [];
    const seenUrls = new Set<string>();

    // Extract product ID from URL (e.g., p00774350 -> 0077/435/0)
    const productIdMatch = url.match(/p(\d{8})/);
    if (productIdMatch) {
        const productId = productIdMatch[1];
        // Zara image URL pattern: /p/XXXX/XXX/XXX/
        const folder = `${productId.slice(0, 4)}/${productId.slice(4, 7)}/${productId.slice(7)}`;

        // Common color codes for Zara products
        const colorCodes = ['250', '800', '712', '620', '401', '707', '505', '064', '251'];

        // Generate potential image URLs
        colorCodes.forEach(color => {
            const baseUrl = `https://static.zara.net/photos///2024/I/0/2/p/${folder}/${color}/2/w/750/${productId}_2_1_1.jpg`;
            const altUrl = `https://static.zara.net/photos///2024/V/0/2/p/${folder}/${color}/2/w/750/${productId}_2_1_1.jpg`;
            images.push(baseUrl);
            images.push(altUrl);
        });
    }

    // Also try to find any static.zara.net URLs in the HTML
    const zaraUrlPattern = /https?:\/\/static\.zara\.net\/photos[^"'\s)]+/gi;
    const matches = html.match(zaraUrlPattern) || [];
    matches.forEach(match => {
        // Clean up the URL
        let cleanUrl = match.replace(/\\u002F/g, '/').replace(/\\/g, '');
        if (!seenUrls.has(cleanUrl)) {
            images.unshift(cleanUrl); // Add at the beginning (these are more reliable)
            seenUrls.add(cleanUrl);
        }
    });

    // Try to find data-src or other lazy-loaded image attributes
    const dataSrcPattern = /data-src=["']([^"']+static\.zara\.net[^"']+)["']/gi;
    let match;
    while ((match = dataSrcPattern.exec(html)) !== null) {
        let imgUrl = match[1].replace(/\\u002F/g, '/');
        if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
        if (!seenUrls.has(imgUrl)) {
            images.unshift(imgUrl);
            seenUrls.add(imgUrl);
        }
    }

    return images.slice(0, 12);
}

// Extract product name from Zara HTML
function extractZaraProductName(html: string, url: string): string {
    // Try multiple patterns
    const patterns = [
        /<h1[^>]*class="[^"]*product-detail-info__header-name[^"]*"[^>]*>([^<]+)<\/h1>/i,
        /"name"\s*:\s*"([^"]+)"/,
        /<title>([^|<]+)/i,
    ];

    for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
            return match[1].replace(/&nbsp;/g, ' ').replace(/\\u0026nbsp;/g, ' ').trim();
        }
    }

    // Extract from URL as fallback
    const urlMatch = url.match(/\/([^/]+)-p\d+\.html/);
    if (urlMatch) {
        return urlMatch[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    return '';
}

export async function POST(request: Request) {
    let url = '';
    try {
        const body = await request.json();
        url = body.url;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const hostname = new URL(url).hostname.toLowerCase();
        const isZara = hostname.includes('zara.com');

        let data: any = null;
        let usedMethod = 'puppeteer';

        // 1. Try Puppeteer (Best for dynamic sites)
        try {
            // @ts-ignore
            const puppeteer = require('puppeteer');

            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled',
                    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                ]
            });

            const page = await browser.newPage();

            // Evade bot detection
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            });

            await page.setViewport({ width: 1280, height: 800 });

            // Use shorter timeout with domcontentloaded for speed
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
            await delay(2000);

            data = await page.evaluate(() => {
                const getMetaContent = (property: string) => {
                    const element = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
                    return element ? element.getAttribute('content') : '';
                };

                const title = getMetaContent('og:title') || document.title || '';
                const mainImage = getMetaContent('og:image') || getMetaContent('og:image:url') || '';
                const description = getMetaContent('og:description') || getMetaContent('description') || '';

                const images: string[] = [];
                const seenUrls = new Set<string>();

                if (mainImage) {
                    let cleanUrl = mainImage.startsWith('//') ? 'https:' + mainImage : mainImage;
                    images.push(cleanUrl);
                    seenUrls.add(cleanUrl);
                }

                // Collect all images with product-related patterns
                document.querySelectorAll('img, source, picture source').forEach((el: any) => {
                    let src = el.src || el.srcset?.split(',')[0]?.split(' ')[0] || el.getAttribute('data-src') || '';
                    if (src.startsWith('//')) src = 'https:' + src;

                    if (src && !seenUrls.has(src) && src.includes('http')) {
                        const isProduct = src.includes('static.') || src.includes('/photos/') ||
                            src.includes('/product') || src.includes('cdn.');
                        const isNotIcon = !src.includes('icon') && !src.includes('logo') &&
                            !src.includes('.svg') && !src.includes('pixel');
                        if (isProduct && isNotIcon) {
                            images.push(src);
                            seenUrls.add(src);
                        }
                    }
                });

                // Get page HTML for further processing
                const pageHtml = document.documentElement.outerHTML;

                return { name: title, imageUrl: mainImage, images, description, html: pageHtml };
            });

            await browser.close();

            // For Zara, try to extract additional images from HTML patterns
            if (isZara && data.html) {
                const zaraImages = extractZaraImages(url, data.html);
                if (zaraImages.length > 0) {
                    const currentImages = new Set(data.images || []);
                    zaraImages.forEach(img => {
                        if (!currentImages.has(img)) {
                            data.images.push(img);
                        }
                    });
                }
                // Get better name for Zara
                if (!data.name || data.name.includes('&nbsp;') || data.name.length < 3) {
                    data.name = extractZaraProductName(data.html, url);
                }
                delete data.html; // Don't send HTML in response
            }

        } catch (puppeteerError) {
            console.warn('Puppeteer failed, falling back to basic fetch:', puppeteerError);
            usedMethod = 'fetch';
        }

        // 2. Fallback to Basic Fetch
        if (!data || !data.name || (data.images?.length || 0) === 0) {
            const html = await fetchHTML(url);
            if (html) {
                const getMetaContent = (property: string) => {
                    const tagRegex = new RegExp(`<meta[^>]*property=["']${property}["'][^>]*>`, 'i');
                    const tagMatch = html.match(tagRegex);
                    if (tagMatch) {
                        const contentMatch = tagMatch[0].match(/content=["']([^"']*)["']/i);
                        return contentMatch ? contentMatch[1] : '';
                    }
                    return '';
                };

                let title = getMetaContent('og:title') || '';
                if (!title) {
                    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
                    if (titleMatch) title = titleMatch[1];
                }
                title = title.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

                let mainImage = getMetaContent('og:image') || '';
                if (mainImage.startsWith('//')) mainImage = 'https:' + mainImage;

                const images: string[] = [];
                if (mainImage) images.push(mainImage);

                // For Zara, use special extraction
                if (isZara) {
                    const zaraImages = extractZaraImages(url, html);
                    zaraImages.forEach(img => {
                        if (!images.includes(img)) images.push(img);
                    });
                    if (!title || title.length < 3) {
                        title = extractZaraProductName(html, url);
                    }
                } else {
                    // Generic image extraction
                    const imgMatches = html.match(/src=["']([^"']+(?:\/photos\/|\/product|static\.)[^"']+)["']/gi) || [];
                    imgMatches.forEach(match => {
                        const srcMatch = match.match(/src=["']([^"']+)["']/i);
                        if (srcMatch) {
                            let src = srcMatch[1];
                            if (src.startsWith('//')) src = 'https:' + src;
                            if (!images.includes(src) && src.includes('http')) {
                                images.push(src);
                            }
                        }
                    });
                }

                // Look for JSON-LD product images
                const ldJsonMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
                if (ldJsonMatches) {
                    ldJsonMatches.forEach(match => {
                        try {
                            const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '');
                            const json = JSON.parse(jsonContent);
                            const extractImages = (obj: any) => {
                                if (obj?.image) {
                                    const imgs = Array.isArray(obj.image) ? obj.image : [obj.image];
                                    imgs.forEach((img: any) => {
                                        const imgUrl = typeof img === 'string' ? img : img?.url || img?.contentUrl;
                                        if (imgUrl && !images.includes(imgUrl)) {
                                            let cleanUrl = imgUrl.startsWith('//') ? 'https:' + imgUrl : imgUrl;
                                            images.push(cleanUrl);
                                        }
                                    });
                                }
                                if (obj?.name && !title) {
                                    title = obj.name;
                                }
                            };
                            if (json['@type'] === 'Product') extractImages(json);
                            if (Array.isArray(json['@graph'])) {
                                json['@graph'].forEach((item: any) => {
                                    if (item['@type'] === 'Product') extractImages(item);
                                });
                            }
                        } catch (e) { }
                    });
                }

                data = {
                    name: title,
                    imageUrl: mainImage || images[0] || '',
                    images: images.slice(0, 12),
                    description: getMetaContent('og:description') || ''
                };
            }
        }

        if (!data) {
            return NextResponse.json({ error: 'Failed to scrape data' }, { status: 500 });
        }

        // Ensure images array exists
        if (!data.images || data.images.length === 0) {
            data.images = data.imageUrl ? [data.imageUrl] : [];
        }

        // Clean the name
        data.name = (data.name || '').replace(/&nbsp;/g, ' ').replace(/\\u0026nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

        // Post-processing - detect clothing type
        let type = 'top';
        const lowerTitle = (data.name || '').toLowerCase();
        if (lowerTitle.includes('pant') || lowerTitle.includes('jeans') || lowerTitle.includes('falda') || lowerTitle.includes('skirt') || lowerTitle.includes('short')) {
            type = 'bottom';
        } else if (lowerTitle.includes('vestido') || lowerTitle.includes('dress') || lowerTitle.includes('mono') || lowerTitle.includes('jumpsuit')) {
            type = 'dress';
        } else if (lowerTitle.includes('abrigo') || lowerTitle.includes('jacket') || lowerTitle.includes('chaqueta') || lowerTitle.includes('cazadora') || lowerTitle.includes('coat') || lowerTitle.includes('blazer')) {
            type = 'outerwear';
        } else if (lowerTitle.includes('zapato') || lowerTitle.includes('shoe') || lowerTitle.includes('botas') || lowerTitle.includes('boots') || lowerTitle.includes('sneaker') || lowerTitle.includes('sandal')) {
            type = 'shoes';
        } else if (lowerTitle.includes('bolso') || lowerTitle.includes('bag') || lowerTitle.includes('cartera') || lowerTitle.includes('cinturón') || lowerTitle.includes('belt') || lowerTitle.includes('gafas') || lowerTitle.includes('glasses')) {
            type = 'accessories';
        }

        return NextResponse.json({
            success: true,
            method: usedMethod,
            data: {
                ...data,
                type,
                brand: new URL(url).hostname.replace('www.', '').split('.')[0],
                url
            }
        });

    } catch (error: any) {
        console.error('Scraping error:', error);
        return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
    }
}
