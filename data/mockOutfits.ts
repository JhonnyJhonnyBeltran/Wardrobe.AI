/**
 * Mock data for Wardrobe.AI - Outfit history following PRD structure
 */

export interface OutfitItem {
  type: 'top' | 'bottom' | 'shoes' | 'accessory';
  name: string;
  brand: string;
  ref: string;
  imageEmoji: string;
}

export interface MockOutfit {
  id: string;
  date: string;
  style: string;
  description: string;
  items: OutfitItem[];
}

export const mockOutfits: MockOutfit[] = [
  {
    id: '1',
    date: '2024-12-20',
    style: 'Casual Chic',
    description: 'Look perfecto para un brunch de fin de semana. Los tonos neutros combinan armoniosamente.',
    items: [
      { type: 'top', name: 'Camisa Blanca Oversize', brand: 'Zara', ref: 'https://zara.com/ref1', imageEmoji: '👔' },
      { type: 'bottom', name: 'Jeans Mom Fit', brand: "Levi's", ref: 'https://levis.com/ref1', imageEmoji: '👖' },
      { type: 'shoes', name: 'Sneakers Blancas', brand: 'Adidas', ref: 'https://adidas.com/ref1', imageEmoji: '👟' },
      { type: 'accessory', name: 'Bolso Shopper Beige', brand: 'Mango', ref: 'https://mango.com/ref1', imageEmoji: '👜' },
    ],
  },
  {
    id: '2',
    date: '2024-12-19',
    style: 'Business Elegante',
    description: 'Outfit sofisticado para reuniones importantes. Transmite profesionalidad y confianza.',
    items: [
      { type: 'top', name: 'Blazer Negro Entallado', brand: 'Massimo Dutti', ref: 'https://massimodutti.com/ref2', imageEmoji: '🧥' },
      { type: 'bottom', name: 'Pantalón de Vestir Crema', brand: 'COS', ref: 'https://cos.com/ref2', imageEmoji: '👖' },
      { type: 'shoes', name: 'Mocasines Negros', brand: 'Massimo Dutti', ref: 'https://massimodutti.com/ref3', imageEmoji: '👞' },
      { type: 'accessory', name: 'Reloj Dorado Minimalista', brand: 'Daniel Wellington', ref: 'https://dw.com/ref1', imageEmoji: '⌚' },
    ],
  },
  {
    id: '3',
    date: '2024-12-18',
    style: 'Date Night',
    description: 'Look romántico y elegante. Los detalles sutiles marcan la diferencia. ✨',
    items: [
      { type: 'top', name: 'Top Satinado Rosa Empolvado', brand: 'Reformation', ref: 'https://reformation.com/ref1', imageEmoji: '👚' },
      { type: 'bottom', name: 'Falda Midi Plisada', brand: 'Sandro', ref: 'https://sandro.com/ref1', imageEmoji: '👗' },
      { type: 'shoes', name: 'Sandalias de Tacón Nude', brand: 'Steve Madden', ref: 'https://stevemadden.com/ref1', imageEmoji: '👠' },
      { type: 'accessory', name: 'Pendientes de Perlas', brand: 'Mejuri', ref: 'https://mejuri.com/ref1', imageEmoji: '💎' },
    ],
  },
  {
    id: '4',
    date: '2024-12-17',
    style: 'Sporty Chic',
    description: 'Comodidad sin sacrificar el estilo. Ideal para un día activo.',
    items: [
      { type: 'top', name: 'Sudadera Cropped Gris', brand: 'Nike', ref: 'https://nike.com/ref1', imageEmoji: '🧥' },
      { type: 'bottom', name: 'Leggings Negros', brand: 'Lululemon', ref: 'https://lululemon.com/ref1', imageEmoji: '🩳' },
      { type: 'shoes', name: 'Air Force 1', brand: 'Nike', ref: 'https://nike.com/ref2', imageEmoji: '👟' },
      { type: 'accessory', name: 'Gorra Baseball Blanca', brand: 'New Era', ref: 'https://newera.com/ref1', imageEmoji: '🧢' },
    ],
  },
  {
    id: '5',
    date: '2024-12-16',
    style: 'Boho Weekend',
    description: 'Vibes relajadas con toques bohemios. Perfecto para un festival o mercadillo.',
    items: [
      { type: 'top', name: 'Blusa Bordada Blanca', brand: 'Free People', ref: 'https://freepeople.com/ref1', imageEmoji: '👚' },
      { type: 'bottom', name: 'Shorts Denim Vintage', brand: "Levi's", ref: 'https://levis.com/ref2', imageEmoji: '🩳' },
      { type: 'shoes', name: 'Sandalias de Cuero', brand: 'Birkenstock', ref: 'https://birkenstock.com/ref1', imageEmoji: '🩴' },
      { type: 'accessory', name: 'Sombrero de Paja', brand: 'Lack of Color', ref: 'https://lackofcolor.com/ref1', imageEmoji: '👒' },
    ],
  },
  {
    id: '6',
    date: '2024-12-15',
    style: 'Party Ready',
    description: '¡Lista para brillar! Look statement para una noche especial. 🎉',
    items: [
      { type: 'top', name: 'Top de Lentejuelas Plateado', brand: 'Zara', ref: 'https://zara.com/ref2', imageEmoji: '✨' },
      { type: 'bottom', name: 'Pantalón Wide Leg Negro', brand: 'Mango', ref: 'https://mango.com/ref2', imageEmoji: '👖' },
      { type: 'shoes', name: 'Tacones Strappy Plateados', brand: 'Aldo', ref: 'https://aldo.com/ref1', imageEmoji: '👠' },
      { type: 'accessory', name: 'Clutch Plateado', brand: 'Parfois', ref: 'https://parfois.com/ref1', imageEmoji: '👛' },
    ],
  },
  {
    id: '7',
    date: '2024-12-14',
    style: 'Minimal Everyday',
    description: 'Menos es más. Un clásico atemporal que nunca falla.',
    items: [
      { type: 'top', name: 'Camiseta Básica Negra', brand: 'COS', ref: 'https://cos.com/ref3', imageEmoji: '👕' },
      { type: 'bottom', name: 'Pantalón Tailored Beige', brand: 'Arket', ref: 'https://arket.com/ref1', imageEmoji: '👖' },
      { type: 'shoes', name: 'Mocasines Loafer Marrones', brand: 'G.H. Bass', ref: 'https://ghbass.com/ref1', imageEmoji: '👞' },
      { type: 'accessory', name: 'Bolso Crossbody Negro', brand: 'A.P.C.', ref: 'https://apc.com/ref1', imageEmoji: '👜' },
    ],
  },
  {
    id: '8',
    date: '2024-12-13',
    style: 'Winter Cozy',
    description: 'Calidez y estilo para los días fríos. Capas que combinan perfectamente.',
    items: [
      { type: 'top', name: 'Jersey de Punto Oversized', brand: 'H&M', ref: 'https://hm.com/ref1', imageEmoji: '🧶' },
      { type: 'bottom', name: 'Jeans Rectos Oscuros', brand: 'Everlane', ref: 'https://everlane.com/ref1', imageEmoji: '👖' },
      { type: 'shoes', name: 'Botas Chelsea Negras', brand: 'Dr. Martens', ref: 'https://drmartens.com/ref1', imageEmoji: '👢' },
      { type: 'accessory', name: 'Bufanda de Lana Gris', brand: 'Acne Studios', ref: 'https://acnestudios.com/ref1', imageEmoji: '🧣' },
    ],
  },
];

export const styleOptions = [
  { value: 'casual', label: 'Casual', icon: '👕', description: 'Día a día relajado' },
  { value: 'chic', label: 'Chic', icon: '✨', description: 'Elegante y sofisticado' },
  { value: 'boho', label: 'Boho', icon: '🌸', description: 'Libre y bohemio' },
  { value: 'streetwear', label: 'Streetwear', icon: '🔥', description: 'Urbano y moderno' },
  { value: 'minimal', label: 'Minimal', icon: '⚪', description: 'Menos es más' },
  { value: 'romantic', label: 'Romántico', icon: '💕', description: 'Dulce y femenino' },
];

export const chatQuickActions = [
  { id: 'trends', label: 'Cuéntame tendencias 🔥', prompt: '¿Cuáles son las tendencias de moda actuales?' },
  { id: 'influencers', label: 'Ponte al día con influencers 💅', prompt: '¿Qué están usando las influencers ahora?' },
];

export const aiResponses: Record<string, string> = {
  trends: `¡Hola, babe! 🌟 Te cuento las tendencias más hot de esta temporada:

• **Cherry Red** - El rojo cereza está EN TODAS PARTES. Desde abrigos hasta accesorios 🍒
• **Quiet Luxury** - Looks minimalistas con tejidos premium. Menos logo, más calidad ✨
• **Baggy Jeans** - Los pantalones oversized siguen reinando 👖
• **Botas Chunky** - Plataformas y suelas gruesas para el invierno 👢
• **Capas y más capas** - El layering es tu mejor amigo ahora

¿Quieres que te arme un outfit con alguna de estas tendencias?`,

  influencers: `¡Aquí tienes el tea de las it-girls! ☕💅

• **Hailey Bieber** sigue con su estética "clean girl" - moños bajos, jeans rectos, y blazers oversized
• **Zendaya** está apostando por looks vintage y power suits con colores bold
• **Rosalía** mezcla streetwear con toques haute couture de manera increíble
• **Kendall Jenner** está muy The Row - minimalismo elevado al máximo

Lo que más se repite: **menos es más**, pero con piezas de calidad que hablen por sí solas 👑

¿Te inspiras en alguna de ellas?`,

  default: `¡Qué buena pregunta, babe! 💕 

Como tu asistente de moda personal, puedo ayudarte con:
• Crear outfits personalizados para cualquier ocasión
• Combinar colores y estilos que te favorezcan
• Darte las últimas tendencias y tips de influencers
• Organizar tu armario virtual

¿En qué puedo ayudarte hoy? ✨`,
};
