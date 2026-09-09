/**
 * AddItemModal Constants
 * Predefined options for dropdowns and form configuration
 */

// Popular brand options
export const BRAND_OPTIONS = [
    'Zara',
    'Mango',
    'H&M',
    'Pull&Bear',
    'Bershka',
    'Stradivarius',
    'Massimo Dutti',
    'COS',
    'Uniqlo',
    'Nike',
    'Adidas',
    'Levi\'s',
    'Tommy Hilfiger',
    'Calvin Klein',
    'Primark',
    'ASOS',
    'Shein',
    'Otra marca',
];

// Size options
export const SIZE_OPTIONS = [
    'XXS',
    'XS',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    'XXXL',
    '34',
    '36',
    '38',
    '40',
    '42',
    '44',
    '46',
    'Única',
    'Otra talla',
];

// Fabric/material options
export const FABRIC_OPTIONS = [
    'Algodón',
    'Poliéster',
    'Lana',
    'Seda',
    'Lino',
    'Denim',
    'Cuero',
    'Piel sintética',
    'Viscosa',
    'Nylon',
    'Terciopelo',
    'Punto',
    'Tweed',
    'Pana',
    'Lycra/Elastano',
    'Cashmere',
    'Otro tejido',
];

// Predefined color options with hex values
export const COLOR_OPTIONS = [
    { name: 'Negro', hex: '#000000' },
    { name: 'Blanco', hex: '#FFFFFF' },
    { name: 'Gris', hex: '#808080' },
    { name: 'Beige', hex: '#D4C4B0' },
    { name: 'Marrón', hex: '#795548' },
    { name: 'Azul marino', hex: '#1A237E' },
    { name: 'Azul', hex: '#2196F3' },
    { name: 'Celeste', hex: '#81D4FA' },
    { name: 'Verde', hex: '#4CAF50' },
    { name: 'Rojo', hex: '#F44336' },
    { name: 'Burdeos', hex: '#800020' },
    { name: 'Rosa', hex: '#E91E63' },
    { name: 'Naranja', hex: '#FF9800' },
    { name: 'Amarillo', hex: '#FFEB3B' },
    { name: 'Morado', hex: '#9C27B0' },
    { name: 'Lavanda', hex: '#E6E6FA' },
];

// Clothing & item type/category options
export const TYPE_OPTIONS = [
    { value: 'top', label: 'Top / Camiseta' },
    { value: 'shirt', label: 'Camisa / Blusa' },
    { value: 'sweater', label: 'Jersey / Suéter' },
    { value: 'hoodie', label: 'Sudadera' },
    { value: 'jacket', label: 'Chaqueta / Cazadora' },
    { value: 'outerwear', label: 'Abrigo / Parka' },
    { value: 'bottom', label: 'Pantalón / Jeans' },
    { value: 'shorts', label: 'Pantalón corto / Shorts' },
    { value: 'skirt', label: 'Falda' },
    { value: 'dress', label: 'Vestido / Mono' },
    { value: 'shoes', label: 'Calzado / Zapatillas' },
    { value: 'bag', label: 'Bolso / Mochila' },
    { value: 'accessory', label: 'Accesorio / Joyería' },
    { value: 'other', label: 'Otros (Libros, objetos, etc.)' },
];

// Season options
export const SEASON_OPTIONS = [
    { value: 'spring', label: 'Primavera' },
    { value: 'summer', label: 'Verano' },
    { value: 'autumn', label: 'Otoño' },
    { value: 'winter', label: 'Invierno' },
    { value: 'all-season', label: 'Todo el año' },
];

// Default form values
export const DEFAULT_FORM_DATA = {
    name: '',
    brand: '',
    type: 'top',
    color: '',
    colorHex: '#000000',
    size: '',
    reference: '',
    fabric: '',
    season: 'spring',
    sourceUrl: '',
};

/**
 * Maps any detected color name or hex to the exact matching entry in COLOR_OPTIONS
 */
export function matchColorToOption(colorName?: string, hex?: string): { name: string; hex: string } {
    if (!colorName && !hex) return COLOR_OPTIONS[0]; // Negro

    const normalized = (colorName || '').trim().toLowerCase();

    // 1. Direct name match
    const exact = COLOR_OPTIONS.find(c => c.name.toLowerCase() === normalized);
    if (exact) return exact;

    // 2. Keyword & semantic match
    if (normalized.includes('marino') || normalized.includes('navy') || normalized.includes('noche')) {
        return COLOR_OPTIONS.find(c => c.name === 'Azul marino')!;
    }
    if (normalized.includes('celeste') || normalized.includes('cielo') || (normalized.includes('claro') && normalized.includes('azul'))) {
        return COLOR_OPTIONS.find(c => c.name === 'Celeste')!;
    }
    if (normalized.includes('azul') || normalized.includes('denim') || normalized.includes('vaquero') || normalized.includes('cyan') || normalized.includes('turquesa')) {
        return COLOR_OPTIONS.find(c => c.name === 'Azul')!;
    }
    if (normalized.includes('negro') || normalized.includes('black') || normalized.includes('antracita') || normalized.includes('oscuro') && normalized.includes('gris')) {
        return COLOR_OPTIONS.find(c => c.name === 'Negro')!;
    }
    if (normalized.includes('blanco') || normalized.includes('white') || normalized.includes('hueso') || normalized.includes('marfil') || normalized.includes('crudo')) {
        return COLOR_OPTIONS.find(c => c.name === 'Blanco')!;
    }
    if (normalized.includes('gris') || normalized.includes('grey') || normalized.includes('gray') || normalized.includes('plata') || normalized.includes('marengo')) {
        return COLOR_OPTIONS.find(c => c.name === 'Gris')!;
    }
    if (normalized.includes('beige') || normalized.includes('crema') || normalized.includes('camel') || normalized.includes('nude') || normalized.includes('arena') || normalized.includes('tostado')) {
        return COLOR_OPTIONS.find(c => c.name === 'Beige')!;
    }
    if (normalized.includes('marrón') || normalized.includes('marron') || normalized.includes('brown') || normalized.includes('chocolate') || normalized.includes('café') || normalized.includes('cuero')) {
        return COLOR_OPTIONS.find(c => c.name === 'Marrón')!;
    }
    if (normalized.includes('burdeos') || normalized.includes('granate') || normalized.includes('vino') || normalized.includes('burgundy')) {
        return COLOR_OPTIONS.find(c => c.name === 'Burdeos')!;
    }
    if (normalized.includes('rojo') || normalized.includes('red') || normalized.includes('carmín') || normalized.includes('coral')) {
        return COLOR_OPTIONS.find(c => c.name === 'Rojo')!;
    }
    if (normalized.includes('rosa') || normalized.includes('pink') || normalized.includes('fucsia') || normalized.includes('magenta')) {
        return COLOR_OPTIONS.find(c => c.name === 'Rosa')!;
    }
    if (normalized.includes('lavanda') || normalized.includes('lila') || normalized.includes('violeta')) {
        return COLOR_OPTIONS.find(c => c.name === 'Lavanda')!;
    }
    if (normalized.includes('morado') || normalized.includes('púrpura') || normalized.includes('purple')) {
        return COLOR_OPTIONS.find(c => c.name === 'Morado')!;
    }
    if (normalized.includes('verde') || normalized.includes('green') || normalized.includes('oliva') || normalized.includes('militar') || normalized.includes('kaki') || normalized.includes('menta')) {
        return COLOR_OPTIONS.find(c => c.name === 'Verde')!;
    }
    if (normalized.includes('naranja') || normalized.includes('orange') || normalized.includes('terracota') || normalized.includes('mostaza') || normalized.includes('caldera')) {
        return COLOR_OPTIONS.find(c => c.name === 'Naranja')!;
    }
    if (normalized.includes('amarillo') || normalized.includes('yellow') || normalized.includes('dorado') || normalized.includes('gold')) {
        return COLOR_OPTIONS.find(c => c.name === 'Amarillo')!;
    }

    // 3. Distance match by HEX if available
    if (hex && hex.startsWith('#') && hex.length >= 7) {
        const r1 = parseInt(hex.slice(1, 3), 16);
        const g1 = parseInt(hex.slice(3, 5), 16);
        const b1 = parseInt(hex.slice(5, 7), 16);

        if (!isNaN(r1) && !isNaN(g1) && !isNaN(b1)) {
            let closest = COLOR_OPTIONS[0];
            let minDist = Infinity;
            for (const opt of COLOR_OPTIONS) {
                const r2 = parseInt(opt.hex.slice(1, 3), 16);
                const g2 = parseInt(opt.hex.slice(3, 5), 16);
                const b2 = parseInt(opt.hex.slice(5, 7), 16);
                const dist = Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2);
                if (dist < minDist) {
                    minDist = dist;
                    closest = opt;
                }
            }
            return closest;
        }
    }

    return COLOR_OPTIONS[0];
}

