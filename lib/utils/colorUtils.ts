/**
 * Color Utility Functions
 * Functions for color extraction, conversion, and naming
 */

/**
 * Extracts the dominant color from an image URL
 */
export const extractDominantColor = (imageUrl: string): Promise<{ hex: string; name: string }> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve({ hex: '#000000', name: 'Negro' });
                return;
            }

            // Reduce size for faster analysis
            const size = 100;
            canvas.width = size;
            canvas.height = size;
            ctx.drawImage(img, 0, 0, size, size);

            const imageData = ctx.getImageData(0, 0, size, size);
            const data = imageData.data;
            const colorCount: { [key: string]: number } = {};

            // Count colors (ignoring transparent and very dark/light pixels)
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];

                // Ignore transparent or nearly transparent pixels
                if (a < 50) continue;

                // Ignore pure whites and pure blacks (likely background)
                const brightness = (r + g + b) / 3;
                if (brightness > 240 || brightness < 15) continue;

                // Reduce precision to group similar colors
                const rr = Math.round(r / 10) * 10;
                const gg = Math.round(g / 10) * 10;
                const bb = Math.round(b / 10) * 10;

                const key = `${rr},${gg},${bb}`;
                colorCount[key] = (colorCount[key] || 0) + 1;
            }

            // Find the most common color
            let dominantColor = { r: 0, g: 0, b: 0 };
            let maxCount = 0;

            for (const [color, count] of Object.entries(colorCount)) {
                if (count > maxCount) {
                    maxCount = count;
                    const [r, g, b] = color.split(',').map(Number);
                    dominantColor = { r, g, b };
                }
            }

            // Convert to hex
            const hex = `#${dominantColor.r.toString(16).padStart(2, '0')}${dominantColor.g.toString(16).padStart(2, '0')}${dominantColor.b.toString(16).padStart(2, '0')}`;
            const name = rgbToColorName(dominantColor.r, dominantColor.g, dominantColor.b);

            resolve({ hex, name });
        };

        img.onerror = () => {
            resolve({ hex: '#000000', name: 'Negro' });
        };
    });
};

/**
 * Converts RGB to HSL
 */
export const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
};

/**
 * Converts Hex to RGB
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

/**
 * Converts RGB to approximate color name (enhanced version)
 */
export const rgbToColorName = (r: number, g: number, b: number): string => {
    const hsl = rgbToHsl(r, g, b);
    const h = hsl.h;
    const s = hsl.s;
    const l = hsl.l;

    // Grays and neutrals (low saturation)
    if (s < 15) {
        if (l < 15) return 'Negro';
        if (l < 30) return 'Gris oscuro';
        if (l < 50) return 'Gris';
        if (l < 70) return 'Gris claro';
        if (l < 90) return 'Blanco hueso';
        return 'Blanco';
    }

    // Very dark colors
    if (l < 15) return 'Negro';

    // Very light colors
    if (l > 90) return 'Blanco';

    // Light colors with some saturation (pastels)
    if (l > 75) {
        if (h >= 0 && h < 30) return 'Rosa claro';
        if (h >= 30 && h < 60) return 'Crema';
        if (h >= 60 && h < 150) return 'Verde menta';
        if (h >= 150 && h < 210) return 'Celeste';
        if (h >= 210 && h < 270) return 'Lavanda';
        if (h >= 270 && h < 330) return 'Rosa claro';
        return 'Crema';
    }

    // Browns and beiges
    if (h >= 20 && h < 45 && s < 50 && l < 60) {
        if (l < 35) return 'Marrón oscuro';
        if (l < 50) return 'Marrón';
        return 'Beige';
    }

    // Reds
    if ((h >= 0 && h < 15) || h >= 345) {
        if (l < 30) return 'Burdeos';
        if (l < 50) return 'Rojo oscuro';
        return 'Rojo';
    }

    // Oranges
    if (h >= 15 && h < 45) {
        if (l < 40) return 'Terracota';
        if (l < 60) return 'Naranja';
        return 'Melocotón';
    }

    // Yellows
    if (h >= 45 && h < 70) {
        if (l < 50) return 'Mostaza';
        if (l < 70) return 'Amarillo';
        return 'Amarillo claro';
    }

    // Greens
    if (h >= 70 && h < 170) {
        if (h < 100) {
            if (l < 40) return 'Verde oliva';
            return 'Verde lima';
        }
        if (l < 30) return 'Verde oscuro';
        if (l < 50) return 'Verde';
        return 'Verde claro';
    }

    // Cyans and teals
    if (h >= 170 && h < 200) {
        if (l < 40) return 'Verde azulado';
        return 'Turquesa';
    }

    // Blues
    if (h >= 200 && h < 260) {
        if (l < 25) return 'Azul marino';
        if (l < 40) return 'Azul oscuro';
        if (l < 60) return 'Azul';
        return 'Celeste';
    }

    // Purples and violets
    if (h >= 260 && h < 290) {
        if (l < 40) return 'Morado oscuro';
        if (l < 65) return 'Morado';
        if (l < 80) return 'Violeta';
        return 'Lila';
    }

    // Magentas and fuchsias
    if (h >= 290 && h < 330) {
        if (l < 40) return 'Magenta oscuro';
        if (l < 70) return 'Fucsia';
        return 'Rosa';
    }

    // Pinks
    if (h >= 330 && h < 345) {
        if (l < 50) return 'Rosa oscuro';
        if (l < 75) return 'Rosa';
        return 'Rosa claro';
    }

    return 'Multicolor';
};

/**
 * Gets color name from hex value
 */
export const getColorNameFromHex = (hex: string): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 'Desconocido';
    return rgbToColorName(rgb.r, rgb.g, rgb.b);
};
