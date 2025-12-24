# 🔄 Sistema de Scraping de Moda - Klozet

> **Última actualización:** Diciembre 2024  
> **Versión:** 1.0.0

## 📋 Resumen

El sistema de scraping de Klozet recopila automáticamente datos de moda de **22 fuentes internacionales** incluyendo revistas de moda, blogs especializados y retailers. Los datos se procesan y estructuran para alimentar el chat AI y el generador de outfits de la aplicación.

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         KLOZET SCRAPING SYSTEM                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                        VERCEL CRON JOBS                                │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                        │ │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │ │
│  │   │   📰 DAILY   │  │   🌐 WEEKLY  │  │  📊 MONTHLY  │                │ │
│  │   │  6:00 AM UTC │  │  Sun 3:00 AM │  │  1st 2:00 AM │                │ │
│  │   │              │  │              │  │              │                │ │
│  │   │ • ELLE USA   │  │ • ELLE ES    │  │ • Lyst Index │                │ │
│  │   │ • Vogue USA  │  │ • Vogue ES   │  │ • Cleanup    │                │ │
│  │   │ • Harper's   │  │ • Glamour ES │  │   (>90 days) │                │ │
│  │   │ • WWW        │  │ • Telva      │  │              │                │ │
│  │   │ • Refinery29 │  │ • Vogue FR   │  │              │                │ │
│  │   │ • Glamour    │  │ • Vogue UK   │  │              │                │ │
│  │   │ • InStyle    │  │ • Vogue IT   │  │              │                │ │
│  │   │              │  │ • Zara       │  │              │                │ │
│  │   │  (7 fuentes) │  │ • Mango      │  │  (1 fuente)  │                │ │
│  │   │              │  │ • H&M        │  │              │                │ │
│  │   │              │  │ (12 fuentes) │  │              │                │ │
│  │   └──────────────┘  └──────────────┘  └──────────────┘                │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                        │
│                                    ▼                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         PROCESAMIENTO                                  │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                        │ │
│  │  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌────────────┐ │ │
│  │  │   Fetcher   │──▶│   Parser    │──▶│     AI      │──▶│   Merger   │ │ │
│  │  │  (RSS/Web)  │   │  (Regex)    │   │ (OpenAI)    │   │ (Dedupe)   │ │ │
│  │  └─────────────┘   └─────────────┘   └─────────────┘   └────────────┘ │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                        │
│                                    ▼                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    DATA STORE (fashionData.json)                       │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                        │ │
│  │  📈 Trends (max 50)    │  👗 Items (max 100)    │  🏷️ Brands (max 20)  │ │
│  │  • Cherry Red          │  • Mango Coat          │  • Loewe (95)        │ │
│  │  • Quiet Luxury        │  • COS Sweater         │  • Mango (85)        │ │
│  │  • Baggy Jeans         │  • Zara Jeans          │  • Zara (82)         │ │
│  │  • ...                 │  • ...                 │  • ...               │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📰 Fuentes de Datos

### 🟢 RSS Feeds (Scraping Diario)

| Fuente | URL | Región | Prioridad |
|--------|-----|--------|-----------|
| **ELLE USA** | `elle.com/rss/fashion.xml` | 🇺🇸 USA | ⭐⭐⭐⭐⭐ |
| **Vogue USA** | `vogue.com/feed/rss` | 🇺🇸 USA | ⭐⭐⭐⭐⭐ |
| **Harper's Bazaar** | `harpersbazaar.com/rss/fashion.xml` | 🇺🇸 USA | ⭐⭐⭐⭐ |
| **WhoWhatWear** | `whowhatwear.com/rss` | 🌍 International | ⭐⭐⭐⭐ |
| **Refinery29** | `refinery29.com/rss.xml` | 🇺🇸 USA | ⭐⭐⭐ |
| **Glamour** | `glamour.com/feed/rss` | 🇺🇸 USA | ⭐⭐⭐ |
| **InStyle** | `instyle.com/feeds/all` | 🇺🇸 USA | ⭐⭐⭐ |

### 🟡 Web Scraping (Semanal)

#### España 🇪🇸

| Fuente | URL | Prioridad |
|--------|-----|-----------|
| **Vogue España** | `vogue.es/moda/tendencias` | ⭐⭐⭐⭐⭐ |
| **ELLE España** | `elle.com/es/moda/tendencias/` | ⭐⭐⭐⭐ |
| **Glamour España** | `glamour.es/moda` | ⭐⭐⭐ |
| **Woman Madame Figaro** | `woman.es/moda` | ⭐⭐⭐ |
| **Telva** | `telva.com/moda/` | ⭐⭐⭐ |

#### Europa 🇪🇺

| Fuente | URL | Región | Prioridad |
|--------|-----|--------|-----------|
| **Vogue France** | `vogue.fr/mode` | 🇫🇷 Francia | ⭐⭐⭐⭐ |
| **ELLE France** | `elle.fr/Mode` | 🇫🇷 Francia | ⭐⭐⭐ |
| **Vogue UK** | `vogue.co.uk/fashion` | 🇬🇧 UK | ⭐⭐⭐⭐ |
| **Vogue Italia** | `vogue.it/moda` | 🇮🇹 Italia | ⭐⭐⭐⭐ |

#### Retailers 🛍️

| Fuente | URL | Tipo de Datos |
|--------|-----|---------------|
| **Zara Novedades** | `zara.com/es/es/mujer-novedades` | Productos + precios |
| **Mango Novedades** | `shop.mango.com/.../novedades` | Productos + precios |
| **H&M Novedades** | `hm.com/.../nuevo-esta-semana` | Productos + precios |

### 🔵 Trends (Mensual)

| Fuente | URL | Datos |
|--------|-----|-------|
| **Lyst Index** | `lyst.com/data/the-lyst-index/` | Top marcas trimestrales |

---

## ⏰ Programación de Jobs

### Horarios (Cron)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CALENDARIO DE SCRAPING                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  DAILY (Cada día a las 6:00 AM UTC / 7:00 AM España)           │
│  ├── Lunes    ──── RSS Feeds (7 fuentes)                       │
│  ├── Martes   ──── RSS Feeds (7 fuentes)                       │
│  ├── Miércoles ─── RSS Feeds (7 fuentes)                       │
│  ├── Jueves   ──── RSS Feeds (7 fuentes)                       │
│  ├── Viernes  ──── RSS Feeds (7 fuentes)                       │
│  ├── Sábado   ──── RSS Feeds (7 fuentes)                       │
│  └── Domingo  ──── RSS Feeds (7 fuentes) + WEEKLY              │
│                                                                 │
│  WEEKLY (Domingo a las 3:00 AM UTC / 4:00 AM España)           │
│  └── Web Scraping de 12 fuentes (magazines + retailers)        │
│                                                                 │
│  MONTHLY (Día 1 a las 2:00 AM UTC / 3:00 AM España)            │
│  └── Lyst Index + Limpieza de datos antiguos                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Expresiones Cron

```json
{
  "crons": [
    { "path": "/api/cron/fashion-daily",   "schedule": "0 6 * * *"   },
    { "path": "/api/cron/fashion-weekly",  "schedule": "0 3 * * 0"   },
    { "path": "/api/cron/fashion-monthly", "schedule": "0 2 1 * *"   }
  ]
}
```

---

## 📂 Estructura de Archivos

```
lib/fashion/
├── types.ts           # Tipos TypeScript (Trend, Item, Brand)
├── sources.ts         # Configuración de 22 fuentes
├── scraper.ts         # Fetcher de RSS feeds
├── webScraper.ts      # Scraper de páginas web
├── parser.ts          # Extractor de contenido
├── aiExtractor.ts     # Extracción con OpenAI (opcional)
├── scheduler.ts       # Gestión de jobs y merge
└── index.ts           # Exportaciones principales

app/api/
├── fashion/
│   ├── route.ts           # API GET/POST datos de moda
│   └── status/
│       └── route.ts       # Estado del pipeline
└── cron/
    ├── fashion-daily/
    │   └── route.ts       # Job diario
    ├── fashion-weekly/
    │   └── route.ts       # Job semanal
    └── fashion-monthly/
        └── route.ts       # Job mensual

data/
└── fashionData.json       # Almacén de datos estructurados
```

---

## 🔧 Características Técnicas

### Rate Limiting

```typescript
// Máximo 1 request cada 2 segundos
const rateLimiter = new RateLimiter(0.5);
```

- ✅ Evita sobrecargar servidores de origen
- ✅ Reduce riesgo de bloqueos
- ✅ Cumple con buenas prácticas de scraping

### User Agent Rotation

```typescript
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120...',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120...',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Firefox/121...',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605...',
];
```

- ✅ Simula diferentes navegadores
- ✅ Evita detección de bots
- ✅ Rotación automática en cada request

### Timeout y Error Handling

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10000); // 10s

try {
    const response = await fetch(url, { signal: controller.signal });
} catch (error) {
    if (error.name === 'AbortError') {
        console.error('Timeout');
    }
}
```

- ✅ Timeout de 10 segundos por request
- ✅ Manejo graceful de errores
- ✅ Continúa con otras fuentes si una falla

---

## 🔌 API Endpoints

### GET `/api/fashion/status`

**Descripción:** Obtiene el estado actual del sistema de scraping.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-12-24T13:21:59.935Z",
  "data": {
    "stats": {
      "trends": 8,
      "items": 12,
      "brands": 8,
      "lastUpdated": "2024-12-22T23:00:00Z"
    },
    "topTrends": [
      { "name": "Quiet Luxury", "popularity": 10 }
    ],
    "topBrands": [
      { "name": "Loewe", "score": 95 }
    ]
  },
  "sources": {
    "total": 22,
    "enabled": 20,
    "byFrequency": {
      "daily": 7,
      "weekly": 12,
      "monthly": 1
    }
  },
  "schedule": {
    "nextRuns": {
      "daily": "2025-12-25T06:00:00.000Z",
      "weekly": "2025-12-28T03:00:00.000Z",
      "monthly": "2026-01-01T02:00:00.000Z"
    }
  }
}
```

### POST `/api/cron/fashion-daily`

**Descripción:** Ejecuta el job de scraping diario manualmente.

**Response:**
```json
{
  "success": true,
  "job": {
    "id": "job-daily-1703423520000",
    "name": "Daily Fashion Scrape",
    "status": "completed"
  },
  "message": "Daily fashion scrape completed"
}
```

### POST `/api/cron/fashion-weekly`

**Descripción:** Ejecuta el job de scraping semanal manualmente.

**Response:**
```json
{
  "success": true,
  "job": { ... },
  "summary": {
    "articlesScraped": 45,
    "productsScraped": 60,
    "trendsTotal": 50,
    "itemsTotal": 100
  }
}
```

### POST `/api/cron/fashion-monthly`

**Descripción:** Ejecuta el job mensual (Lyst + cleanup).

**Response:**
```json
{
  "success": true,
  "insights": {
    "topTrends": ["Quiet Luxury", "Cherry Red"],
    "topBrands": ["Loewe", "Miu Miu"],
    "emergingTrends": ["Butter Yellow"]
  },
  "cleanup": {
    "itemsCleaned": 15,
    "trendsCleaned": 5
  }
}
```

---

## 🚀 Uso

### Desarrollo Local

```bash
# Ver estado del sistema
curl http://localhost:3000/api/fashion/status

# Ejecutar scraping diario
curl -X POST http://localhost:3000/api/cron/fashion-daily

# Ejecutar scraping semanal
curl -X POST http://localhost:3000/api/cron/fashion-weekly

# Ejecutar scraping mensual
curl -X POST http://localhost:3000/api/cron/fashion-monthly
```

### Producción (Vercel)

1. El archivo `vercel.json` ya configura los cron jobs
2. Los jobs se ejecutan automáticamente según el horario
3. Añade `CRON_SECRET` a las variables de entorno para protección

```env
CRON_SECRET=tu-secreto-aqui
OPENAI_API_KEY=sk-...  # Opcional, para extracción AI
```

---

## 📊 Datos Extraídos

### Tendencias (Trends)

```typescript
interface FashionTrend {
  id: string;              // "trend-cherry-red"
  name: string;            // "Cherry Red"
  category: TrendCategory; // "color" | "garment" | "style" | ...
  description: string;     // "El rojo cereza domina..."
  season: string;          // "Winter 2025"
  source: string;          // "ELLE"
  sourceUrl: string;       // Link al artículo
  imageUrl?: string;       // Imagen representativa
  popularity: number;      // 1-10
  relatedItems: string[];  // IDs de items relacionados
}
```

### Prendas (Items)

```typescript
interface ShoppableItem {
  id: string;              // "item-1"
  name: string;            // "Abrigo Rojo Cereza"
  brand: string;           // "Mango"
  type: ItemType;          // "outerwear" | "top" | "bottom" | ...
  description: string;
  color?: string;          // "Cherry Red"
  colorHex?: string;       // "#C41E3A"
  price?: string;          // "149.99€"
  priceRange?: PriceRange; // "budget" | "mid" | "premium" | "luxury"
  buyLink?: string;        // Link de compra
  imageUrl?: string;
  trending: boolean;
  source: string;
}
```

### Marcas (Brands)

```typescript
interface Brand {
  id: string;           // "loewe"
  name: string;         // "Loewe"
  tier: BrandTier;      // "fast-fashion" | "contemporary" | "designer" | "luxury"
  trendingScore: number; // 1-100 (del Lyst Index)
  website?: string;
  logoUrl?: string;
}
```

---

## ⚠️ Consideraciones Legales

| ✅ Permitido | ⚠️ Precauciones |
|--------------|-----------------|
| RSS son feeds públicos | No almacenar contenido completo |
| Rate limiting respetado | Links pueden ser affiliate |
| User-Agent identificado | Respetar robots.txt |
| Solo metadatos extraídos | Atribuir fuente original |

---

## 🔮 Roadmap

### Próximas Mejoras

- [ ] **Pinterest Trends API** - Datos visuales
- [ ] **Instagram Scraping** - Outfits de influencers
- [ ] **Affiliate Links** - Integración ShopStyle/Skimlinks
- [ ] **Price Tracking** - Alertas de ofertas
- [ ] **Image Recognition** - Identificar prendas en fotos
- [ ] **ML Recommendations** - Personalización basada en usuario

---

## 📞 Soporte

Para problemas con el sistema de scraping:

1. Revisar logs en Vercel Dashboard
2. Verificar `/api/fashion/status` 
3. Ejecutar job manual para debugging
4. Revisar `data/fashionData.json` para datos actuales

---

*Documentación generada para Klozet v1.0.0*
