/**
 * Background Removal Service
 * Uses rembg Python service or Remove.bg API
 */

export interface BackgroundRemovalResult {
    success: boolean;
    imageUrl: string;
    originalUrl?: string;
    error?: string;
}

/**
 * Remove background from image using rembg Python service
 * Requires Python service running on localhost:5000
 */
export async function removeBackgroundRembg(
    imageFile: File | string
): Promise<BackgroundRemovalResult> {
    try {
        const formData = new FormData();

        if (typeof imageFile === 'string') {
            // URL - fetch and convert to blob
            const response = await fetch(imageFile);
            const blob = await response.blob();
            formData.append('image', blob, 'image.jpg');
        } else {
            // File object
            formData.append('image', imageFile);
        }

        // Call Python rembg service
        const response = await fetch('http://localhost:5000/remove-bg', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Background removal failed');
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        return {
            success: true,
            imageUrl,
            originalUrl: typeof imageFile === 'string' ? imageFile : undefined,
        };
    } catch (error) {
        console.error('Background removal error:', error);
        return {
            success: false,
            imageUrl: '',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Remove background using Remove.bg API (paid)
 */
export async function removeBackgroundAPI(
    imageFile: File | string,
    apiKey: string
): Promise<BackgroundRemovalResult> {
    try {
        const formData = new FormData();

        if (typeof imageFile === 'string') {
            formData.append('image_url', imageFile);
        } else {
            formData.append('image_file', imageFile);
        }

        formData.append('size', 'auto');

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        return {
            success: true,
            imageUrl,
            originalUrl: typeof imageFile === 'string' ? imageFile : undefined,
        };
    } catch (error) {
        console.error('Remove.bg API error:', error);
        return {
            success: false,
            imageUrl: '',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Client-side simulation (for development)
 * Returns original image with CSS treatment
 */
export function simulateBackgroundRemoval(imageUrl: string): BackgroundRemovalResult {
    return {
        success: true,
        imageUrl: imageUrl,
        originalUrl: imageUrl,
    };
}
