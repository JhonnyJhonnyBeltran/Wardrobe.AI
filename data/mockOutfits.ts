/**
 * Mock data for Klozet - Integrated with real fashion data including images and shop links
 */

import fashionData from './fashionData.json';

export interface OutfitItem {
  type: 'top' | 'bottom' | 'shoes' | 'accessory' | 'outerwear' | 'bag';
  name: string;
  brand: string;
  ref: string;
  color: string;
  imageUrl?: string;
  buyLink?: string;
  price?: string;
}

export interface MockOutfit {
  id: string;
  date: string;
  style: string;
  description: string;
  items: OutfitItem[];
}

// Convert fashion data items to outfit format with images and links
const mapItemToOutfitItem = (item: typeof fashionData.items[0]): OutfitItem => ({
  type: item.type as OutfitItem['type'],
  name: item.name,
  brand: item.brand,
  ref: item.buyLink || item.source || '#',
  color: item.colorHex || '#CCCCCC',
  imageUrl: item.imageUrl,
  buyLink: item.buyLink,
  price: item.price,
});

// Get item by type or fallback
const getItemByType = (items: typeof fashionData.items, type: string, fallbackIndex: number = 0) => {
  return items.find(i => i.type === type) || items[fallbackIndex];
};

// Get item containing keyword in name
const getItemByKeyword = (items: typeof fashionData.items, keyword: string, fallback: typeof fashionData.items[0]) => {
  return items.find(i => i.name.toLowerCase().includes(keyword.toLowerCase())) || fallback;
};

// Generate outfits from real fashion data with images
const generateOutfitsFromData = (): MockOutfit[] => {
  const items = fashionData.items;
  const trends = fashionData.trends;

  // Group items by type
  const tops = items.filter(i => i.type === 'top');
  const bottoms = items.filter(i => i.type === 'bottom');
  const shoes = items.filter(i => i.type === 'shoes');
  const bags = items.filter(i => i.type === 'bag');
  const outerwear = items.filter(i => i.type === 'outerwear');

  const outfits: MockOutfit[] = [
    {
      id: '1',
      date: '2024-12-22',
      style: 'Quiet Luxury',
      description: trends.find(t => t.name === 'Quiet Luxury')?.description || 'Minimalismo con tejidos premium.',
      items: [
        mapItemToOutfitItem(tops[0] || items[1]),
        mapItemToOutfitItem(bottoms[0] || items[2]),
        mapItemToOutfitItem(shoes[0] || items[7]),
        mapItemToOutfitItem(bags[0] || items[3]),
      ],
    },
    {
      id: '2',
      date: '2024-12-21',
      style: 'Cherry Red Statement',
      description: trends.find(t => t.name === 'Cherry Red')?.description || 'El rojo cereza como protagonista.',
      items: [
        mapItemToOutfitItem(getItemByKeyword(items, 'rojo', outerwear[0])),
        mapItemToOutfitItem(bottoms[1] || bottoms[0]),
        mapItemToOutfitItem(shoes[1] || shoes[0]),
        mapItemToOutfitItem(bags[1] || bags[0]),
      ],
    },
    {
      id: '3',
      date: '2024-12-20',
      style: 'Street Chic',
      description: 'Estilo urbano con piezas de diseñador. Oversized leather jacket como estrella.',
      items: [
        mapItemToOutfitItem(getItemByKeyword(items, 'cuero', outerwear[1])),
        mapItemToOutfitItem(getItemByKeyword(items, 'jeans', bottoms[0])),
        mapItemToOutfitItem(shoes[0]),
        mapItemToOutfitItem(bags[0]),
      ],
    },
    {
      id: '4',
      date: '2024-12-19',
      style: 'Business Minimal',
      description: 'Elegancia corporativa con cortes limpios. Quiet Luxury como inspiración.',
      items: [
        mapItemToOutfitItem(tops[0]),
        mapItemToOutfitItem(getItemByKeyword(items, 'tailored', bottoms[0])),
        mapItemToOutfitItem(getItemByKeyword(items, 'bailarina', shoes[0])),
        mapItemToOutfitItem(bags[1] || bags[0]),
      ],
    },
    {
      id: '5',
      date: '2024-12-18',
      style: 'Weekend Casual',
      description: 'Comodidad con estilo para el fin de semana. Denim protagonista.',
      items: [
        mapItemToOutfitItem(tops[1] || tops[0]),
        mapItemToOutfitItem(getItemByKeyword(items, '501', bottoms[0])),
        mapItemToOutfitItem(shoes[0]),
        mapItemToOutfitItem(bags[0]),
      ],
    },
    {
      id: '6',
      date: '2024-12-17',
      style: 'Date Night',
      description: 'Look romántico para una cena. Siluetas fluidas y colores sofisticados.',
      items: [
        mapItemToOutfitItem(getItemByKeyword(items, 'punto', tops[0])),
        mapItemToOutfitItem(bottoms[0]),
        mapItemToOutfitItem(shoes[1] || shoes[0]),
        mapItemToOutfitItem(getItemByKeyword(items, 'puzzle', bags[0])),
      ],
    },
    {
      id: '7',
      date: '2024-12-16',
      style: 'It-Girl Approved',
      description: 'Lo que llevan las influencers. Loewe, Massimo Dutti y piezas statement.',
      items: [
        mapItemToOutfitItem(outerwear[2] || outerwear[0]),
        mapItemToOutfitItem(bottoms[0]),
        mapItemToOutfitItem(shoes[0]),
        mapItemToOutfitItem(getItemByKeyword(items, 'loewe', bags[0])),
      ],
    },
    {
      id: '8',
      date: '2024-12-15',
      style: 'Winter Layers',
      description: trends.find(t => t.name === 'Layering')?.description || 'El arte de las capas perfectas.',
      items: [
        mapItemToOutfitItem(tops[0]),
        mapItemToOutfitItem(getItemByKeyword(items, 'camel', outerwear[0])),
        mapItemToOutfitItem(bottoms[1] || bottoms[0]),
        mapItemToOutfitItem(getItemByKeyword(items, 'plataforma', shoes[0])),
      ],
    },
  ];

  return outfits;
};

export const mockOutfits: MockOutfit[] = generateOutfitsFromData();

// Style options with gradients - matching current trends
export const styleOptions = [
  { value: 'quietluxury', label: 'Quiet Luxury', gradient: 'from-stone-400 to-stone-600' },
  { value: 'cherryred', label: 'Cherry Red', gradient: 'from-red-400 to-rose-600' },
  { value: 'minimal', label: 'Minimal', gradient: 'from-gray-400 to-slate-500' },
  { value: 'streetwear', label: 'Street', gradient: 'from-violet-400 to-purple-500' },
  { value: 'romantic', label: 'Romántico', gradient: 'from-rose-400 to-pink-500' },
  { value: 'boho', label: 'Boho', gradient: 'from-amber-400 to-yellow-500' },
];

// Quick actions for chat
export const chatQuickActions = [
  { id: 'trends', label: 'Tendencias', prompt: '¿Cuáles son las tendencias de moda actuales?' },
  { id: 'influencers', label: 'Influencers', prompt: '¿Qué están usando las influencers ahora?' },
  { id: 'brands', label: 'Marcas', prompt: '¿Cuáles son las marcas más trending?' },
];

// AI responses using real data
export const aiResponses: Record<string, string> = {
  trends: `Las tendencias actuales incluyen: ${fashionData.trends.slice(0, 3).map(t => t.name).join(', ')}`,
  influencers: `Las it-girls apuestan por: ${fashionData.brands.slice(0, 3).map(b => b.name).join(', ')}`,
  default: `Estoy al día con las tendencias de ${fashionData.trends[0]?.season || 'esta temporada'}.`,
};
