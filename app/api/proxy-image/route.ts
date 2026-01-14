import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy endpoint to fetch images from external URLs.
 * This avoids CORS issues when trying to fetch images for client-side processing.
 * Returns the image as a base64 data URL that can be used directly by the client.
 */
export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json(
                { success: false, error: 'URL is required' },
                { status: 400 }
            );
        }

        // Validate URL format
        try {
            new URL(url);
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        // Fetch the image from the external URL
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
                'Referer': new URL(url).origin + '/',
            },
        });

        if (!response.ok) {
            console.error(`[proxy-image] Failed to fetch ${url}: ${response.status} ${response.statusText}`);
            return NextResponse.json(
                { success: false, error: `Failed to fetch image: ${response.status}` },
                { status: response.status }
            );
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';

        // Verify it's actually an image
        if (!contentType.startsWith('image/')) {
            return NextResponse.json(
                { success: false, error: 'URL does not point to an image' },
                { status: 400 }
            );
        }

        // Convert to base64
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const dataUrl = `data:${contentType};base64,${base64}`;

        return NextResponse.json({
            success: true,
            dataUrl,
            contentType,
            size: arrayBuffer.byteLength,
        });

    } catch (error: any) {
        console.error('[proxy-image] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to proxy image' },
            { status: 500 }
        );
    }
}
