# 🎯 Fashion Data Pipeline - Klozet

## Resumen

Este documento describe el sistema completo de scraping y extracción de datos de moda para la aplicación Klozet. El pipeline obtiene **tendencias**, **prendas específicas**, y **datos de marcas** de múltiples fuentes internacionales y españolas.

---

## 📰 Fuentes de Datos

### 📅 Scraping Diario (RSS Feeds)

| Fuente | URL | Tipo de Datos | Región |
|--------|-----|---------------|--------|
| **ELLE USA** | `elle.com/rss/fashion.xml` | Tendencias, outfits | USA |
| **Vogue USA** | `vogue.com/feed/rss` | Pasarela, streetstyle | USA |
| **WhoWhatWear** | `whowhatwear.com/rss` | Shopping, trends | International |
| **Harper's Bazaar** | `harpersbazaar.com/rss/fashion.xml` | Luxury, pasarela | USA |
| **Refinery29** | `refinery29.com/rss.xml` | Streetstyle, budget | USA |
| **Glamour** | `glamour.com/feed/rss` | Lifestyle, trends | USA |
| **InStyle** | `instyle.com/feeds/all` | Celebrity style | USA |

### 📅 Scraping Semanal (Web Scraping)

| Fuente | URL | Tipo de Datos | Región |
|--------|-----|---------------|--------|
| **ELLE España** | `elle.com/es/moda/tendencias/` | Tendencias locales | Spain |
| **Vogue España** | `vogue.es/moda/tendencias` | Pasarela, street | Spain |
| **Glamour España** | `glamour.es/moda` | Lifestyle, shopping | Spain |
| **Woman Madame Figaro** | `woman.es/moda` | Tendencias | Spain |
| **Telva** | `telva.com/moda/` | Clásico, elegante | Spain |
| **Vogue France** | `vogue.fr/mode` | París Fashion Week | France |
| **Vogue UK** | `vogue.co.uk/fashion` | London style | UK |
| **Vogue Italia** | `vogue.it/moda` | Milan Fashion Week | Italy |

### 🛍️ Retailers (Productos Nuevos)

| Fuente | URL | Tipo de Datos |
|--------|-----|---------------|
| **Zara** | `zara.com/es/es/mujer-novedades` | Novedades, precios |
| **Mango** | `shop.mango.com/es/mujer/featured/novedades` | Novedades, precios |
| **H&M** | `hm.com/es_es/mujer/nuevo-esta-semana` | Novedades, precios |

### 📅 Scraping Mensual (Trends)

| Fuente | URL | Tipo de Datos |
|--------|-----|---------------|
| **Lyst Index** | `lyst.com/data/the-lyst-index/` | Top marcas trimestrales |

---

## 🏗️ Arquitectura del Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      KLOZET FASHION DATA PIPELINE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         CRON JOBS (Vercel)                           │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │  📰 Daily (6:00 AM)    │  🌐 Weekly (Sunday)  │  📊 Monthly (1st)   │   │
│  │  RSS Feeds             │  Web Scraping        │  Lyst + Cleanup     │   │
│  │  7 sources             │  12 sources          │  1 source           │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                          DATA PROCESSING                             │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                │   │
│  │  │   Parser    │   │     AI      │   │   Merger    │                │   │
│  │  │  (Regex)    │──▶│  Extractor  │──▶│  (Dedupe)   │                │   │
│  │  │             │   │  (OpenAI)   │   │             │                │   │
│  │  └─────────────┘   └─────────────┘   └─────────────┘                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      STRUCTURED DATA STORE                           │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │                     data/fashionData.json                            │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │   Trends     │  │    Items     │  │   Brands     │               │   │
│  │  │  (max 50)    │  │  (max 100)   │  │  (max 20)    │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                     ┌──────────────┴──────────────┐                        │
│                     ▼                              ▼                        │
│         ┌─────────────────────┐       ┌─────────────────────┐             │
│         │     Chat AI         │       │   Outfit Generator  │             │
│         │  (contexto real)    │       │   (sugerencias)     │             │
│         └─────────────────────┘       └─────────────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Estructura de Datos

### Tendencia (Trend)

```typescript
interface FashionTrend {
  id: string;
  name: string;              // "Cherry Red"
  category: 'color' | 'garment' | 'style' | 'accessory' | 'pattern';
  description: string;       // Descripción corta
  season: string;            // "Winter 2025", "SS26"
  source: string;            // "ELLE", "WhoWhatWear"
  sourceUrl: string;         // Link al artículo original
  imageUrl?: string;         // Imagen representativa
  popularity: number;        // 1-10 (calculado por menciones)
  relatedItems: string[];    // IDs de items relacionados
  createdAt: Date;
  updatedAt: Date;
}
```

### Prenda (ShoppableItem)

```typescript
interface ShoppableItem {
  id: string;
  name: string;              // "R13 Jane Jeans"
  brand: string;             // "R13"
  type: 'top' | 'bottom' | 'shoes' | 'accessory' | 'outerwear' | 'dress' | 'bag';
  description: string;
  color?: string;            // Color principal
  colorHex?: string;         // Hex code
  buyLink?: string;          // Link de compra
  price?: string;            // "149.99€"
  priceRange?: 'budget' | 'mid' | 'premium' | 'luxury';
  imageUrl?: string;
  trending: boolean;
  trendIds: string[];        // Tendencias asociadas
  source: string;
  sourceUrl?: string;
  createdAt: Date;
}
```

### Marca (Brand)

```typescript
interface Brand {
  id: string;
  name: string;              // "Miu Miu"
  tier: 'fast-fashion' | 'contemporary' | 'designer' | 'luxury';
  trendingScore: number;     // Del Lyst Index (1-100)
  logoUrl?: string;
  website?: string;
}
```

---

## 🔧 Archivos del Sistema

```
lib/fashion/
├── types.ts           # Tipos TypeScript
├── sources.ts         # Configuración de 20+ fuentes
├── scraper.ts         # Servicio RSS
├── webScraper.ts      # Servicio Web Scraping  
├── parser.ts          # Extractores de contenido
├── aiExtractor.ts     # Extracción con OpenAI
├── scheduler.ts       # Programación de jobs
└── index.ts           # Export principal

app/api/
├── fashion/
│   ├── route.ts       # GET/POST datos de moda
│   └── status/
│       └── route.ts   # Estado del pipeline
└── cron/
    ├── fashion-daily/
    │   └── route.ts   # Job diario (RSS)
    ├── fashion-weekly/
    │   └── route.ts   # Job semanal (Web)
    └── fashion-monthly/
        └── route.ts   # Job mensual (Trends + Cleanup)

data/
└── fashionData.json   # Datos estructurados
```

---

## ⏰ Programación de Scraping

### Cron Jobs (Vercel)

```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/fashion-daily", "schedule": "0 6 * * *" },
    { "path": "/api/cron/fashion-weekly", "schedule": "0 3 * * 0" },
    { "path": "/api/cron/fashion-monthly", "schedule": "0 2 1 * *" }
  ]
}
```

| Job | Frecuencia | Horario (UTC) | Qué hace |
|-----|------------|---------------|----------|
| **Daily** | Cada día | 6:00 AM | RSS feeds de revistas principales |
| **Weekly** | Domingo | 3:00 AM | Web scraping de revistas españolas + retailers |
| **Monthly** | Día 1 | 2:00 AM | Lyst Index + limpieza de datos antiguos |

### Ejecución Manual

```bash
# Trigger diario
curl -X POST http://localhost:3000/api/cron/fashion-daily

# Trigger semanal
curl -X POST http://localhost:3000/api/cron/fashion-weekly

# Trigger mensual
curl -X POST http://localhost:3000/api/cron/fashion-monthly

# Ver estado
curl http://localhost:3000/api/fashion/status
```

---

## 🔐 Variables de Entorno

```env
# OpenAI para extracción con IA (opcional pero recomendado)
OPENAI_API_KEY=sk-...

# Secret para validar cron requests (producción)
CRON_SECRET=your-secret-here
```

---

## 📊 API Endpoints

### GET `/api/fashion`
Obtener datos de moda actuales.

```typescript
// Query params
type?: 'trends' | 'items' | 'brands'  // Filtrar por tipo
limit?: number                         // Límite de resultados (default: 10)

// Response
{
  success: true,
  data: {
    trends: FashionTrend[],
    items: ShoppableItem[],
    brands: Brand[]
  },
  lastUpdated: string
}
```

### POST `/api/fashion`
Refrescar datos manualmente.

```typescript
// Body
{
  useAI?: boolean  // Usar IA para extracción (default: false)
}

// Response
{
  success: true,
  message: "Fashion data refreshed",
  stats: {
    trends: number,
    items: number,
    brands: number
  }
}
```

### GET `/api/fashion/status`
Ver estado del pipeline.

```typescript
// Response
{
  success: true,
  status: "healthy",
  data: {
    stats: { trends, items, brands },
    topTrends: [...],
    topBrands: [...]
  },
  sources: {
    total: number,
    enabled: number,
    byFrequency: { daily, weekly, monthly }
  },
  schedule: {
    nextRuns: { daily, weekly, monthly }
  }
}
```

---

## 🚀 Uso en la App

### Chat AI con Contexto Real

```typescript
import { generateChatContext, fetchFashionData } from '@/lib/fashion';

const fashionData = await fetchFashionData();
const context = generateChatContext(fashionData);

const systemPrompt = `Eres un asistente de moda experto.

${context}

Usa esta información real para dar recomendaciones precisas.
Menciona marcas y prendas específicas cuando sea relevante.`;
```

### Generador de Outfits

```typescript
import { FashionDataStore } from '@/lib/fashion';

function generateOutfit(data: FashionDataStore, style: string) {
  const trendingItems = data.items.filter(i => i.trending);
  
  return {
    top: trendingItems.find(i => i.type === 'top'),
    bottom: trendingItems.find(i => i.type === 'bottom'),
    shoes: trendingItems.find(i => i.type === 'shoes'),
    accessory: trendingItems.find(i => i.type === 'accessory'),
  };
}
```

---

## 📝 Consideraciones Legales

- ✅ RSS son feeds públicos diseñados para consumo externo
- ✅ Rate limiting implementado (máx 0.5 requests/segundo)
- ✅ User-Agent rotation para web scraping
- ⚠️ No almacenamos contenido completo, solo metadatos
- ⚠️ Links de compra pueden ser affiliate links originales
- ⚠️ Respetamos `robots.txt` de cada sitio

---

## 🔮 Futuras Mejoras

1. **Pinterest Trends API** - Datos visuales de tendencias
2. **Instagram Scraping** - Outfits de influencers (requiere autenticación)
3. **Affiliate Integration** - ShopStyle Collective, Skimlinks
4. **Price Tracking** - Alertas de ofertas en items favoritos
5. **Image Recognition** - Identificar prendas en fotos subidas
6. **Personalized Recommendations** - ML basado en preferencias del usuario

---

*Última actualización: Diciembre 2024*
