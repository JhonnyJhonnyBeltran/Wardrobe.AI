import { NextResponse } from 'next/server';
import { fetchHTML } from '@/lib/fashion/webScraper';

export async function POST(request: Request) {
  let url = '';
  try {
    const body = await request.json();
    url = body.url;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let data: any = null;
    let usedMethod = 'puppeteer';

    // 1. Try Puppeteer (Best for dynamic sites like Zara)
    try {
        // Use require to avoid Turbopack bundling issues on Windows
        // @ts-ignore
        const puppeteer = require('puppeteer');
        
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });

        // Timeout 15s to be faster, fallback if slow
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

        data = await page.evaluate(() => {
            const getMetaContent = (property: string) => {
                const element = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
                return element ? element.getAttribute('content') : '';
            };

            const title = getMetaContent('og:title') || document.title || '';
            const image = getMetaContent('og:image') || getMetaContent('og:image:url') || '';
            const description = getMetaContent('og:description') || getMetaContent('description') || '';
            
            let price = getMetaContent('product:price:amount');
            
            if (!price) {
                const scripts = document.querySelectorAll('script[type="application/ld+json"]');
                for (const script of scripts) {
                    try {
                        const json = JSON.parse(script.innerText);
                        if (json['@type'] === 'Product' || json['@type'] === 'ProductGroup') {
                            if (json.offers) {
                                if (Array.isArray(json.offers)) {
                                    price = json.offers[0].price;
                                } else {
                                    price = json.offers.price;
                                }
                            }
                        }
                    } catch (e) {}
                }
            }

            if (!price) {
                const priceElement = document.querySelector('.price') || document.querySelector('[data-qa-qualifier="product-price"]');
                if (priceElement) {
                    price = priceElement.textContent?.replace(/[^0-9.,]/g, '') || '';
                }
            }

            return { name: title, imageUrl: image, description, price };
        });

        await browser.close();
    } catch (puppeteerError) {
        console.warn('Puppeteer failed, falling back to basic fetch:', puppeteerError);
        usedMethod = 'fetch';
        // Fallback will be handled below if data is null
    }

    // 2. Fallback to Basic Fetch (if Puppeteer failed)
    if (!data || !data.name) {
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
            
            const getMetaNameContent = (name: string) => {
                const tagRegex = new RegExp(`<meta[^>]*name=["']${name}["'][^>]*>`, 'i');
                const tagMatch = html.match(tagRegex);
                if (tagMatch) {
                    const contentMatch = tagMatch[0].match(/content=["']([^"']*)["']/i);
                    return contentMatch ? contentMatch[1] : '';
                }
                return '';
            };

            let title = getMetaContent('og:title') || getMetaNameContent('title');
            if (!title) {
                const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
                if (titleMatch) title = titleMatch[1];
            }
            
            const image = getMetaContent('og:image') || getMetaContent('og:image:url') || '';
            const description = getMetaContent('og:description') || getMetaNameContent('description') || '';
            
            let price = getMetaContent('product:price:amount');
            if (!price) {
                const priceRegex = /["']price["']\s*:\s*["']?(\d+[.,]?\d*)["']?/i;
                const priceMatch = html.match(priceRegex);
                if (priceMatch) price = priceMatch[1];
            }

            data = { name: title, imageUrl: image, description, price };
        }
    }

    if (!data) {
        return NextResponse.json({ error: 'Failed to scrape data' }, { status: 500 });
    }

    // Post-processing
    let type = 'top';
    const lowerTitle = (data.name || '').toLowerCase();
    if (lowerTitle.includes('pant') || lowerTitle.includes('jeans') || lowerTitle.includes('falda') || lowerTitle.includes('skirt')) {
        type = 'bottom';
    } else if (lowerTitle.includes('vestido') || lowerTitle.includes('dress')) {
        type = 'dress';
    } else if (lowerTitle.includes('abrigo') || lowerTitle.includes('jacket') || lowerTitle.includes('chaqueta') || lowerTitle.includes('cazadora')) {
        type = 'outerwear';
    } else if (lowerTitle.includes('zapato') || lowerTitle.includes('shoe') || lowerTitle.includes('botas')) {
        type = 'shoes';
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
