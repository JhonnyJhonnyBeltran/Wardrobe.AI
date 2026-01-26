/**
 * AddItemModal Constants
 * Predefined options for dropdowns and form configuration
 */

// Processing status messages shown during AI image processing
export const PROCESSING_MESSAGES = [
    'Analizando imagen...',
    'Quitando fondo...',
    'Detectando bordes...',
    'Recortando imagen...',
    'Enderezando prenda...',
    'Centrando objeto...',
    'Optimizando resultado...',
];

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

// Clothing type/category options
export const TYPE_OPTIONS = [
    { value: 'top', label: 'Top / Camiseta' },
    { value: 'shirt', label: 'Camisa' },
    { value: 'sweater', label: 'Jersey / Suéter' },
    { value: 'bottom', label: 'Pantalón' },
    { value: 'skirt', label: 'Falda' },
    { value: 'dress', label: 'Vestido' },
    { value: 'outerwear', label: 'Abrigo / Chaqueta' },
    { value: 'shoes', label: 'Calzado' },
    { value: 'accessory', label: 'Accesorio' },
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
