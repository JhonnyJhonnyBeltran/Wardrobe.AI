import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates whether a given URL is safe to fetch (Prevents SSRF attacks)
 */
function isSafeUrl(urlStr: string): boolean {
    try {
        const parsed = new URL(urlStr);
        // Only allow standard http and https protocols
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return false;
        }

        const hostname = parsed.hostname.toLowerCase();

        // Block localhost, loopback, cloud metadata and private IP ranges
        if (
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '::1' ||
            hostname === '0.0.0.0' ||
            hostname === '169.254.169.254' || // AWS/GCP/Azure metadata
            hostname.endsWith('.localhost') ||
            hostname.endsWith('.local') ||
            hostname.endsWith('.internal')
        ) {
            return false;
        }

        // Check for private IPv4 ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
        const ipParts = hostname.split('.');
        if (ipParts.length === 4 && ipParts.every(p => /^\d+$/.test(p))) {
            const first = parseInt(ipParts[0], 10);
            const second = parseInt(ipParts[1], 10);

            if (first === 10) return false;
            if (first === 127) return false;
            if (first === 169 && second === 254) return false;
            if (first === 172 && second >= 16 && second <= 31) return false;
            if (first === 192 && second === 168) return false;
            if (first === 0) return false;
        }

        return true;
    } catch {
        return false;
    }
}

/**
 * Proxy endpoint to fetch images from external URLs safely.
 * This avoids CORS issues when trying to fetch images for client-side processing.
 * Returns the image as a base64 data URL that can be used directly by the client.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { url } = body;

        if (!url || typeof url !== 'string') {
            return NextResponse.json(
                { success: false, error: 'URL is required' },
                { status: 400 }
            );
        }

        // Validate URL and prevent SSRF
        if (!isSafeUrl(url)) {
            return NextResponse.json(
                { success: false, error: 'Invalid or restricted URL' },
                { status: 400 }
            );
        }

        // Fetch the image from the external URL with a strict timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
                'Referer': new URL(url).origin + '/',
            },
        });
        clearTimeout(timeout);

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

        // Limit size to max 15MB to prevent memory exhaustion
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength > 15 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'Image size exceeds 15MB limit' },
                { status: 400 }
            );
        }

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
