import { NextResponse } from 'next/server';
import { fetchHTML } from '@/lib/fashion/webScraper';

// Helper function to wait
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// Inditex Group Store Detection
// ============================================================================

const INDITEX_STORES = [
    'zara.com',
    'pullandbear.com',
    'bershka.com',
    'stradivarius.com',
    'massimodutti.com',
    'oysho.com'
];

const INDITEX_CDNS = [
    'static.zara.net',
    'static.pullandbear.com',
    'static.bershka.com',
    'static.stradivarius.com',
    'static.massimodutti.com',
    'static.oysho.com',
    'media.pullandbear.com',
    'media.bershka.com',
    'media.stradivarius.com',
    'media.massimodutti.com',
    'media.oysho.com',
    'img.ltwebstatic.com', // Shein
    'lp2.hm.com', // H&M
    'st.mngbcn.com' // Mango
];

function isInditexStore(hostname: string): boolean {
    return INDITEX_STORES.some(store => hostname.includes(store));
}

function getStoreName(hostname: string): string {
    for (const store of INDITEX_STORES) {
        if (hostname.includes(store)) {
            return store.replace('.com', '');
        }
    }
    return hostname.replace('www.', '').split('.')[0];
}

// ============================================================================
// Generic Image Extraction for Inditex Group & Other Retailers
// ============================================================================

/**
 * Extract product images from Inditex group stores (Zara, Pull&Bear, Bershka, etc.)
 * These stores share similar URL patterns for their CDNs
 */
function extractInditexImages(url: string, html: string, knownImages: string[] = []): string[] {
    const images: string[] = [...knownImages];
    const seenUrls = new Set<string>(knownImages);
    const hostname = new URL(url).hostname.toLowerCase();

    // 1. Extract from static CDN URLs in HTML
    const cdnPatterns = [
        /https?:\/\/static\.[a-z]+\.(?:net|com)\/photos[^"'\s)>]+/gi,
        /https?:\/\/media\.[a-z]+\.com\/[^"'\s)>]+\.(?:jpg|jpeg|png|webp)/gi,
        /\/\/static\.[a-z]+\.(?:net|com)\/photos[^"'\s)>]+/gi,
    ];

    for (const pattern of cdnPatterns) {
        const matches = html.match(pattern) || [];
        matches.forEach(match => {
            let cleanUrl = match
                .replace(/\\u002F/g, '/')
                .replace(/\\/g, '')
                .replace(/&amp;/g, '&');

            if (cleanUrl.startsWith('//')) {
                cleanUrl = 'https:' + cleanUrl;
            }

            // Filter product images (exclude icons, logos, thumbnails too small)
            if (cleanUrl.includes('/photos/') || cleanUrl.includes('/product')) {
                // Prefer larger images
                if (!cleanUrl.includes('_icon') &&
                    !cleanUrl.includes('logo') &&
                    !cleanUrl.includes('sprite')) {
                    if (!seenUrls.has(cleanUrl)) {
                        images.push(cleanUrl);
                        seenUrls.add(cleanUrl);
                    }
                }
            }
        });
    }

    // 2. Extract from data-src, data-image, srcset attributes
    const lazyLoadPatterns = [
        /data-src=["']([^"']+(?:static|media)\.[^"']+)["']/gi,
        /data-image=["']([^"']+(?:static|media)\.[^"']+)["']/gi,
        /srcset=["']([^"']+(?:static|media)\.[^"']+?)[\s,]/gi,
    ];

    for (const pattern of lazyLoadPatterns) {
        let match;
        while ((match = pattern.exec(html)) !== null) {
            let imgUrl = match[1].replace(/\\u002F/g, '/');
            if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
            if (!seenUrls.has(imgUrl)) {
                images.push(imgUrl);
                seenUrls.add(imgUrl);
            }
        }
    }

    // 3. Try to generate URLs from product ID pattern (Zara-style)
    const productIdMatch = url.match(/p(\d{8})/);
    if (productIdMatch && hostname.includes('zara')) {
        const productId = productIdMatch[1];
        const folder = `${productId.slice(0, 4)}/${productId.slice(4, 7)}/${productId.slice(7)}`;
        const colorCodes = ['250', '800', '712', '620', '401', '707', '505', '064', '251'];
        const seasons = ['I', 'V']; // Invierno/Verano

        colorCodes.forEach(color => {
            seasons.forEach(season => {
                const baseUrl = `https://static.zara.net/photos///2024/${season}/0/2/p/${folder}/${color}/2/w/750/${productId}_2_1_1.jpg`;
                if (!seenUrls.has(baseUrl)) {
                    images.push(baseUrl);
                    seenUrls.add(baseUrl);
                }
            });
        });
    }

    // 4. For Pull&Bear, Bershka, etc. - extract from JSON data in page
    const jsonImagePattern = /"(?:image|src|url)":\s*"(https?:\/\/[^"]+(?:\.jpg|\.jpeg|\.png|\.webp)[^"]*)"/gi;
    let jsonMatch;
    while ((jsonMatch = jsonImagePattern.exec(html)) !== null) {
        const imgUrl = jsonMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
        if (!seenUrls.has(imgUrl) && !imgUrl.includes('icon') && !imgUrl.includes('logo')) {
            images.push(imgUrl);
            seenUrls.add(imgUrl);
        }
    }



    // 5. IMPORTANT: Algorithmically generate image variations for Inditex
    // Pattern: .../ID_SEQUENCE_ANGLE_SIZE.jpg (e.g., .../3550531681_4_1_1.jpg)
    // Find a good seed URL
    const seedUrl = images.find(img => img.match(/\d+_\d+_\d+_\d+\.jpg/));

    if (seedUrl) {
        // Extract parts: (prefix)(id)_(seq)_(angle)_(size)(ext)
        const parts = seedUrl.match(/(.*\/)(\d+)_(\d+)_(\d+)_(\d+)(\.jpg.*)/);

        if (parts) {
            const [_, path, id, seq, angle, size, ext] = parts;
            const cleanExt = ext.split('?')[0];

            // Generate variations 1 through 8 (Standard Inditex shots)
            for (let i = 1; i <= 8; i++) {
                // Try to keep original logic, but iterate the sequence
                // Inditex usually uses _1_1_1, _2_1_1, etc. for different views
                // Sometimes the captured one is _4_1_1, so we want _1_1_1, _2_1_1...
                const newUrl = `${path}${id}_${i}_1_1${cleanExt}`;

                if (!seenUrls.has(newUrl)) {
                    images.push(newUrl);
                    seenUrls.add(newUrl);
                }
            }
        }
    }

    return images.slice(0, 20);
}

/**
 * Extract images from H&M
 */
function extractHMImages(html: string): string[] {
    const images: string[] = [];
    const seenUrls = new Set<string>();

    // H&M uses lp2.hm.com CDN
    const hmPattern = /https?:\/\/lp2\.hm\.com\/[^"'\s)>]+\.(?:jpg|jpeg|png|webp)/gi;
    const matches = html.match(hmPattern) || [];

    matches.forEach(match => {
        const cleanUrl = match.replace(/&amp;/g, '&');
        if (!seenUrls.has(cleanUrl)) {
            images.push(cleanUrl);
            seenUrls.add(cleanUrl);
        }
    });

    return images.slice(0, 12);
}

/**
 * Extract images from Mango
 */
function extractMangoImages(html: string): string[] {
    const images: string[] = [];
    const seenUrls = new Set<string>();

    // Mango uses st.mngbcn.com CDN
    const mangoPattern = /https?:\/\/st\.mngbcn\.com\/[^"'\s)>]+\.(?:jpg|jpeg|png|webp)/gi;
    const matches = html.match(mangoPattern) || [];

    matches.forEach(match => {
        const cleanUrl = match.replace(/&amp;/g, '&');
        if (!seenUrls.has(cleanUrl) && !cleanUrl.includes('_icon') && !cleanUrl.includes('logo')) {
            images.push(cleanUrl);
            seenUrls.add(cleanUrl);
        }
    });

    return images.slice(0, 12);
}

/**
 * Extract images from Shein
 */
function extractSheinImages(html: string): string[] {
    const images: string[] = [];
    const seenUrls = new Set<string>();

    // Shein uses img.ltwebstatic.com CDN
    const sheinPattern = /https?:\/\/img\.ltwebstatic\.com\/[^"'\s)>]+\.(?:jpg|jpeg|png|webp)/gi;
    const matches = html.match(sheinPattern) || [];

    matches.forEach(match => {
        const cleanUrl = match.replace(/&amp;/g, '&');
        if (!seenUrls.has(cleanUrl) && cleanUrl.includes('product')) {
            images.push(cleanUrl);
            seenUrls.add(cleanUrl);
        }
    });

    return images.slice(0, 12);
}

// Extract product name from Inditex HTML (works for all group stores)
function extractInditexProductName(html: string, url: string, hostname: string): string {
    // Try multiple patterns
    const patterns = [
        /<h1[^>]*class="[^"]*product[^"]*name[^"]*"[^>]*>([^<]+)<\/h1>/i,
        /<h1[^>]*class="[^"]*product-detail-info__header-name[^"]*"[^>]*>([^<]+)<\/h1>/i,
        /"name"\s*:\s*"([^"]+)"/,
        /<title>([^|<]+)/i,
        /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i,
    ];

    for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
            const cleanName = match[1]
                .replace(/&nbsp;/g, ' ')
                .replace(/\\u0026nbsp;/g, ' ')
                .replace(/&#[0-9]+;/g, '')
                .replace(/\s+/g, ' ')
                .trim();

            if (cleanName.length > 2) {
                return cleanName;
            }
        }
    }

    // Extract from URL as fallback
    const urlPatterns = [
        /\/([^/]+)-p\d+\.html/,      // Zara style
        /\/([^/]+)-\d+\.html/,        // Pull&Bear, Bershka style
        /\/product\/([^/]+)/,         // Generic product URL
    ];

    for (const pattern of urlPatterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        }
    }

    return '';
}

/**
 * Filter images to remove placeholders or broken links
 */
async function filterValidImages(images: string[]): Promise<string[]> {
    const uniqueImages = Array.from(new Set(images));

    // Process in parallel with timeout
    const validations = uniqueImages.map(async (url) => {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 1500); // 1.5s timeout per image

            const response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            clearTimeout(id);

            if (!response.ok) return null;

            const size = response.headers.get('content-length');
            // Filter extremely small images (< 2KB) which are usually placeholders
            if (size && parseInt(size) < 2000) return null;

            return url;
        } catch {
            return null;
        }
    });

    const results = await Promise.all(validations);
    return results.filter((url): url is string => url !== null);
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
        const isInditex = isInditexStore(hostname);
        const isHM = hostname.includes('hm.com') || hostname.includes('h&m');
        const isMango = hostname.includes('mango.com');
        const isShein = hostname.includes('shein.com');

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

                // Helper to add image
                const addImage = (src: string) => {
                    if (!src) return;
                    if (src.startsWith('//')) src = 'https:' + src;

                    if (src.includes('http') && !seenUrls.has(src)) {
                        const isNotIcon = !src.includes('icon') && !src.includes('logo') &&
                            !src.includes('.svg') && !src.includes('pixel') &&
                            !src.includes('sprite');

                        if (isNotIcon) {
                            images.push(src);
                            seenUrls.add(src);
                        }
                    }
                };

                if (mainImage) addImage(mainImage);

                // 1. Check all IMG tags (visible and large enough)
                const imgElements = Array.from(document.querySelectorAll('img'));
                imgElements.forEach((img: any) => {
                    // Check natural size - must be decently large to be a product photo
                    // Fashion images are usually high quality
                    const isBigEnough = (img.naturalWidth > 200 || img.naturalHeight > 200);

                    // Check URL pattern as fallback for lazy loaded or hidden images
                    const src = img.src || img.currentSrc || img.getAttribute('data-src') || '';
                    const hasProductKeywords = src.includes('product') || src.includes('photo') ||
                        src.includes('large') || src.includes('zoom') ||
                        src.includes('gallery');

                    if (isBigEnough || hasProductKeywords) {
                        addImage(src);
                    }
                });

                // 2. Check for background images on DIVs (often used in sliders/galleries)
                const divElements = Array.from(document.querySelectorAll('div, a, span, li'));
                divElements.forEach((el: any) => {
                    const style = window.getComputedStyle(el);
                    const bgImage = style.backgroundImage;
                    if (bgImage && bgImage !== 'none' && bgImage.startsWith('url(')) {
                        // Extract URL from url("...")
                        const match = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
                        if (match && match[1]) {
                            // Check size of element
                            const rect = el.getBoundingClientRect();
                            if (rect.width > 100 && rect.height > 100) {
                                addImage(match[1]);
                            }
                        }
                    }
                });

                // 3. Last resort: scan picture sources
                document.querySelectorAll('source').forEach((el: any) => {
                    const src = el.srcset?.split(',')[0]?.split(' ')[0] || '';
                    if (src && (src.naturalWidth > 200 || src.includes('product') || src.includes('photo'))) {
                        addImage(src);
                    }
                });

                // Get page HTML for further processing
                const pageHtml = document.documentElement.outerHTML;

                return { name: title, imageUrl: mainImage, images, description, html: pageHtml };
            });

            await browser.close();

            // Extract additional images based on store type
            if (data.html) {
                let storeImages: string[] = [];

                if (isInditex) {
                    storeImages = extractInditexImages(url, data.html, data.images || []);
                } else if (isHM) {
                    storeImages = extractHMImages(data.html);
                } else if (isMango) {
                    storeImages = extractMangoImages(data.html);
                } else if (isShein) {
                    storeImages = extractSheinImages(data.html);
                }

                if (storeImages.length > 0) {
                    const currentImages = new Set(data.images || []);
                    storeImages.forEach((img: string) => {
                        if (!currentImages.has(img)) {
                            data.images.push(img);
                        }
                    });
                }

                // Get better name for supported stores
                if (!data.name || data.name.includes('&nbsp;') || data.name.length < 3) {
                    data.name = extractInditexProductName(data.html, url, hostname);
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

                // Extract images based on store type
                let storeImages: string[] = [];

                if (isInditex) {
                    storeImages = extractInditexImages(url, html, images);
                } else if (isHM) {
                    storeImages = extractHMImages(html);
                } else if (isMango) {
                    storeImages = extractMangoImages(html);
                } else if (isShein) {
                    storeImages = extractSheinImages(html);
                } else {
                    // Generic image extraction for unsupported stores
                    // Generic image extraction for unsupported stores - BROADER REGEX
                    // Match jpg, jpeg, png, webp urls in src attributes
                    const imgMatches = html.match(/src=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi) || [];
                    imgMatches.forEach(match => {
                        const srcMatch = match.match(/src=["']([^"']+)["']/i);
                        if (srcMatch) {
                            let src = srcMatch[1];
                            if (src.startsWith('//')) src = 'https:' + src;

                            const isNotIcon = !src.includes('icon') && !src.includes('logo') && !src.includes('avatar');

                            if (!images.includes(src) && src.includes('http') && isNotIcon) {
                                storeImages.push(src);
                            }
                        }
                    });
                }

                storeImages.forEach((img: string) => {
                    if (!images.includes(img)) images.push(img);
                });

                if (!title || title.length < 3) {
                    title = extractInditexProductName(html, url, hostname);
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
                                            const cleanUrl = imgUrl.startsWith('//') ? 'https:' + imgUrl : imgUrl;
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

        // VALIDATE IMAGES (Remove broken/blank ones)
        if (data.images && data.images.length > 0) {
            // Only validate if we have many images (likely generated) or if it's Inditex
            if (data.images.length > 3 || isInditex) {
                data.images = await filterValidImages(data.images);
            }
        }

        // Ensure we still have at least one image (fallback to original if all failed validation)
        if (data.images.length === 0 && data.imageUrl) {
            data.images = [data.imageUrl];
        }

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
