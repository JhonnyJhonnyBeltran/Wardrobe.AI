# 👗 Sistema de Generación de Outfits - Klozet

> **Última actualización:** Diciembre 2024  
> **Versión:** 1.0.0

## 📋 Resumen

El sistema de generación de outfits de Klozet crea combinaciones de ropa trendy usando datos actualizados del scraping de moda. El algoritmo considera tendencias actuales, compatibilidad de colores, marcas preferidas y ocasión de uso.

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       OUTFIT GENERATION SYSTEM                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         INPUT LAYER                                  │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │   Options    │  │  Fashion     │  │   User       │               │   │
│  │  │   (Style,    │  │  Data Store  │  │   Closet     │               │   │
│  │  │   Occasion)  │  │  (Scraped)   │  │   (Optional) │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      GENERATION ENGINE                               │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │   Style     │  │   Color     │  │   Trend     │  │   Item     │  │   │
│  │  │   Matcher   │──▶│   Analyzer  │──▶│   Scorer    │──▶│   Selector │  │   │
│  │  │             │  │             │  │             │  │            │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │   │
│  │                                                                      │   │
│  │  Style Configs (10 estilos) + Occasion Rules + Brand Preferences    │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                       OUTPUT + STORAGE                               │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │  Generated   │  │   Outfit     │  │   History    │               │   │
│  │  │  Outfit      │──▶│   Database   │──▶│   & Stats    │               │   │
│  │  │  (JSON)      │  │  (JSON file) │  │              │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Estilos Disponibles

| Estilo | Descripción | Colores Principales | Marcas Preferidas |
|--------|-------------|---------------------|-------------------|
| **quietluxury** | Minimalismo elegante con tejidos premium | Beige, Taupe, Crema | The Row, COS, Totême |
| **streetwear** | Estilo urbano con sneakers y oversize | Negro, Blanco, Rojo | Nike, Adidas, Zara |
| **casual** | Look relajado para el día a día | Azul, Blanco, Beige | Zara, Mango, Levi's |
| **formal** | Elegancia clásica para eventos | Negro, Blanco, Oro | Massimo Dutti, Sandro |
| **romantic** | Femenino con detalles delicados | Rosa, Nude, Crema | Reformation, Sandro |
| **business** | Profesional para la oficina | Gris, Azul marino, Negro | Massimo Dutti, COS |
| **boho** | Espíritu libre y natural | Marrón, Verde, Dorado | Free People, Isabel Marant |
| **sporty** | Athleisure moderno | Negro, Blanco, Neón | Nike, Lululemon |
| **party** | Glamour nocturno | Negro, Dorado, Plateado | Zara, Self-Portrait |
| **trending** | Lo más actual según tendencias | Según tendencias | Loewe, Miu Miu |

---

## 🎯 Ocasiones

| Ocasión | Estilos Adecuados | Items Requeridos |
|---------|-------------------|------------------|
| **everyday** | casual, streetwear, quietluxury | top, bottom, shoes |
| **work** | business, quietluxury, formal | top, bottom, shoes |
| **date** | romantic, quietluxury, formal | shoes (dress opcional) |
| **party** | party, streetwear | shoes (dress opcional) |
| **weekend** | casual, boho, sporty | top, bottom, shoes |
| **formal** | formal, quietluxury | shoes (dress opcional) |
| **travel** | casual, sporty, streetwear | top, bottom, shoes, bag |

---

## 📂 Estructura de Archivos

```
lib/fashion/
├── outfitGenerator.ts     # Lógica de generación
├── outfitDatabase.ts      # Base de datos JSON
└── index.ts               # Exports

app/api/outfits/
├── route.ts               # API principal (GET/POST)
└── actions/
    └── route.ts           # Acciones (favorite, share...)

data/
├── fashionData.json       # Datos del scraping
└── outfitsDb.json         # Base de datos de outfits
```

---

## 🔧 Algoritmo de Generación

### 1. Scoring de Items

Cada prenda recibe un **matchScore** (0-100) basado en:

| Factor | Peso | Descripción |
|--------|------|-------------|
| **Marca preferida** | +20 | Si la marca está en la lista del estilo |
| **Color compatible** | +15 | Similitud con la paleta del estilo |
| **Keywords** | +10 | Coincidencias con palabras clave |
| **Trending** | +15 | Si el item está marcado como trending |
| **Alineación con tendencias** | +10 | Si está asociado a trends populares |

### 2. Selección de Items

```typescript
// Para cada tipo de prenda...
for (const type of ['top', 'bottom', 'shoes', 'bag', 'outerwear']) {
    const ratio = styleConfig.itemRatios[type]; // 0.0 - 1.0
    const shouldInclude = Math.random() < ratio;
    
    if (shouldInclude) {
        // Seleccionar de los 3 mejores con algo de aleatoriedad
        const candidates = itemsByType[type].slice(0, 3);
        const selected = candidates[randomIndex];
        outfit.items.push(selected);
    }
}
```

### 3. Cálculo de Trending Score

```typescript
trendingScore = (itemsTrending / totalItems) * 100
```

---

## 📊 Estructura de Datos

### GeneratedOutfit

```typescript
interface GeneratedOutfit {
  id: string;                    // "outfit-1766583290208-d15yqgt1"
  name: string;                  // "It-Girl Approved - Cherry Red"
  style: OutfitStyle;            // "trending"
  occasion: OutfitOccasion;      // "everyday"
  season: Season;                // "winter"
  description: string;           // "Lo más actual..."
  items: OutfitItem[];           // Array de prendas
  totalItems: number;            // 4
  trendingScore: number;         // 100 (0-100)
  estimatedPrice: string;        // "150-400€"
  priceRange: string;            // "Mid-Range"
  matchedTrends: string[];       // ["Cherry Red", "Quiet Luxury"]
  createdAt: string;             // ISO date
  aiGenerated: boolean;          // true
}
```

### OutfitItem

```typescript
interface OutfitItem {
  id: string;
  name: string;           // "Abrigo Rojo Cereza"
  brand: string;          // "Mango"
  type: ItemType;         // "outerwear"
  color?: string;         // "Cherry Red"
  colorHex?: string;      // "#C41E3A"
  imageUrl?: string;      // URL de imagen
  buyLink?: string;       // URL de compra
  price?: string;         // "149.99€"
  priceRange?: string;    // "mid"
  source: string;         // "ELLE"
  trending: boolean;      // true
  matchScore: number;     // 85 (0-100)
}
```

---

## 🔌 API Endpoints

### POST `/api/outfits` - Generar Outfits

**Request:**
```json
{
  "action": "generate",
  "options": {
    "style": "trending",
    "occasion": "everyday",
    "season": "winter",
    "preferredBrands": ["Zara", "Mango"],
    "priceRange": "mid",
    "numberOfOutfits": 3
  },
  "userId": "user-123"
}
```

**Response:**
```json
{
  "success": true,
  "action": "generate",
  "count": 3,
  "data": [
    {
      "id": "outfit-xxx",
      "name": "It-Girl Approved",
      "style": "trending",
      "items": [...],
      "trendingScore": 100,
      "matchedTrends": ["Cherry Red"]
    }
  ],
  "fashionDataAge": "2025-12-24T13:24:48.160Z"
}
```

### GET `/api/outfits` - Obtener Outfits

**Query Params:**
- `type`: `'trending'` | `'recent'` | `'saved'` | `'favorites'`
- `style`: Ver estilos disponibles
- `occasion`: Ver ocasiones
- `limit`: Número máximo (default: 10)
- `userId`: Para filtrar por usuario

**Response:**
```json
{
  "success": true,
  "type": "recent",
  "count": 5,
  "data": [...]
}
```

### POST `/api/outfits/actions` - Acciones

**Request:**
```json
{
  "action": "favorite",  // or "view", "share", "delete"
  "outfitId": "outfit-xxx",
  "userId": "user-123"
}
```

---

## 💾 Base de Datos

### Estructura

```typescript
interface OutfitDatabase {
  outfits: SavedOutfit[];     // Todos los outfits guardados
  history: UserOutfitHistory[]; // Historial de acciones
  stats: {
    totalGenerated: number;
    totalSaved: number;
    totalShared: number;
    lastUpdated: string;
  };
}
```

### Operaciones Disponibles

| Función | Descripción |
|---------|-------------|
| `saveOutfit()` | Guardar outfit |
| `getOutfitById()` | Obtener por ID |
| `getOutfits()` | Listar con filtros |
| `getTrendingOutfits()` | Top por views/shares |
| `getRecentOutfits()` | Más recientes |
| `toggleFavorite()` | Marcar/desmarcar favorito |
| `recordOutfitView()` | Registrar vista |
| `recordOutfitShare()` | Registrar compartido |
| `deleteOutfit()` | Eliminar |
| `cleanOldOutfits()` | Limpiar >90 días |

---

## 🚀 Uso

### Generar Outfit Trending

```typescript
import { generateOutfits, FashionDataStore } from '@/lib/fashion';

const outfits = generateOutfits(fashionData, {
  style: 'trending',
  occasion: 'everyday',
  numberOfOutfits: 3,
});
```

### Obtener Recomendaciones

```typescript
import { getTrendingOutfitRecommendations } from '@/lib/fashion';

const recommendations = getTrendingOutfitRecommendations(fashionData, 5);
```

### Match User Closet con Tendencias

```typescript
import { matchUserClosetWithTrends } from '@/lib/fashion';

const matches = matchUserClosetWithTrends(userItems, fashionData);
// Retorna items del usuario que coinciden con tendencias actuales
```

---

## 📈 Ejemplo de Outfit Generado

```json
{
  "id": "outfit-1766583290208-d15yqgt1",
  "name": "It-Girl Approved - Cherry Red",
  "style": "trending",
  "occasion": "everyday",
  "season": "winter",
  "trendingScore": 100,
  "priceRange": "Mid-Range",
  "estimatedPrice": "150-400€",
  "matchedTrends": ["Cherry Red", "Quiet Luxury"],
  "items": [
    {
      "name": "Top Punto Calado",
      "brand": "Sandro",
      "type": "top",
      "price": "195€",
      "imageUrl": "https://...",
      "buyLink": "https://sandro-paris.com/...",
      "matchScore": 79
    },
    {
      "name": "501 Original Jeans",
      "brand": "Levi's",
      "type": "bottom",
      "price": "110€",
      "matchScore": 80
    },
    {
      "name": "Bailarinas Lazo",
      "brand": "Massimo Dutti",
      "type": "shoes",
      "price": "79.95€",
      "matchScore": 79
    },
    {
      "name": "Abrigo Rojo Cereza",
      "brand": "Mango",
      "type": "outerwear",
      "price": "149.99€",
      "matchScore": 85
    }
  ]
}
```

---

## 🔮 Futuras Mejoras

- [ ] **AI-powered styling** - Usar GPT para descripciones personalizadas
- [ ] **User preferences learning** - Aprender gustos del usuario
- [ ] **Color wheel compatibility** - Análisis avanzado de colores
- [ ] **Weather-based suggestions** - Outfits según clima
- [ ] **Virtual try-on integration** - Probar antes de comprar
- [ ] **Social sharing** - Compartir en Instagram/Pinterest

---

*Documentación generada para Klozet v1.0.0*
