# 🤖 Fashion Bot Microservice

A standalone AI-powered microservice for fashion trend scraping and dynamic outfit generation.

## 📋 Features

- **🕷️ Automated Scraping**: Daily/weekly scraping of fashion RSS feeds and websites
- **🤖 AI Outfit Generation**: OpenAI-powered dynamic outfit creation
- **📊 Trend Analysis**: Real-time fashion trend tracking
- **🔗 REST API**: Full API for integration with the main Klozet app
- **📅 Scheduled Jobs**: Cron-based automation for data freshness

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Main App (Klozet)                   │
│                     http://localhost:3000                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTP/REST
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      Fashion Bot Service                    │
│                     http://localhost:3001                   │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Scraping   │  │     AI      │  │   Data      │         │
│  │  Service    │  │   Service   │  │   Store     │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                 │                │
│         ▼                ▼                 ▼                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    RSS      │  │   OpenAI    │  │    JSON     │         │
│  │   Feeds     │  │  GPT-4o     │  │   Files     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd services/fashion-bot
npm install
```

### 2. Configure Environment

```bash
cp env.template .env
# Edit .env with your settings
```

Required environment variables:
- `OPENAI_API_KEY`: Your OpenAI API key for AI generation
- `PORT`: Service port (default: 3001)
- `MAIN_APP_URL`: Main Klozet app URL for CORS

### 3. Run the Service

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

## 📡 API Endpoints

### Health Check

```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "service": "fashion-bot",
  "version": "1.0.0",
  "uptime": 12345
}
```

### Generate Outfit

```http
POST /api/generate
Content-Type: application/json

{
  "style": "trending",
  "occasion": "everyday",
  "season": "winter",
  "preferredColors": ["black", "white"],
  "preferredBrands": ["Zara", "COS"],
  "priceRange": "mid",
  "mood": "chic minimalist",
  "description": "Something elegant for a gallery opening"
}
```

Response:
```json
{
  "success": true,
  "outfit": {
    "id": "outfit-xxx",
    "name": "Gallery Chic",
    "style": "quiet luxury",
    "description": "Un look sofisticado perfecto para eventos artísticos",
    "items": [...],
    "aiGenerated": true,
    "aiReasoning": "He seleccionado piezas minimalistas en tonos neutros..."
  }
}
```

### Generate Multiple Outfits

```http
POST /api/generate/multiple
Content-Type: application/json

{
  "count": 3,
  "options": {
    "style": "casual",
    "season": "spring"
  }
}
```

### Generate from Description

```http
POST /api/generate/from-description
Content-Type: application/json

{
  "description": "Necesito un look para una primera cita en un restaurante italiano"
}
```

### Get Trends

```http
GET /api/trends?limit=10
```

### Get Items

```http
GET /api/items?type=top&trending=true
```

### Sync All Data

```http
GET /api/data
```

### Trigger Manual Scrape

```http
POST /api/scrape
Content-Type: application/json

{
  "type": "daily",
  "secret": "your_api_secret"
}
```

### Get Statistics

```http
GET /api/stats
```

## 🕐 Scheduled Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| Daily Scrape | 6:00 AM | RSS feeds from fashion publications |
| Weekly Scrape | Sunday 3:00 AM | Deep scrape + data cleanup |

Configure schedules via environment variables:
- `SCRAPING_DAILY_HOUR`: Hour for daily scrape (0-23)
- `SCRAPING_WEEKLY_DAY`: Day for weekly scrape (0=Sunday)

## 🔗 Integration with Main App

### Using the Client

```typescript
import { FashionBotClient } from '@/lib/fashionBotClient';

const client = new FashionBotClient();

// Generate outfit
const outfit = await client.generateOutfit({
  style: 'casual',
  occasion: 'weekend',
});

// Get trends
const trends = await client.getTrends(10);

// Sync all data
const data = await client.syncData();
```

### Using the React Hook

```tsx
import { useFashionBot } from '@/lib/fashionBotClient';

function MyComponent() {
  const { generateOutfit, getTrends, isHealthy } = useFashionBot();
  
  const handleGenerate = async () => {
    const outfit = await generateOutfit({ style: 'trending' });
    console.log(outfit);
  };
}
```

### Via API Proxy

The main app has a proxy at `/api/bot` that handles communication:

```typescript
const response = await fetch('/api/bot', {
  method: 'POST',
  body: JSON.stringify({
    action: 'generate',
    options: { style: 'casual' },
  }),
});
```

## 📊 Data Sources

### RSS Feeds (Daily)
- WhoWhatWear
- ELLE
- Harper's Bazaar
- Vogue

### Brands Tracked
| Tier | Brands |
|------|--------|
| Fast Fashion | Zara, Mango, H&M |
| Contemporary | COS, Massimo Dutti, Levi's, Dr. Martens |
| Premium | Sandro, Maje, Reformation |
| Designer | The Row, Totême, Jacquemus |
| Luxury | Loewe, Bottega Veneta, Gucci, Prada |

## 🧪 Development

### Project Structure

```
services/fashion-bot/
├── src/
│   ├── index.ts           # Entry point
│   ├── routes/
│   │   └── index.ts       # API routes
│   ├── services/
│   │   ├── AIService.ts   # OpenAI integration
│   │   ├── DataStore.ts   # Data persistence
│   │   └── ScrapingService.ts
│   └── utils/
│       └── logger.ts      # Winston logger
├── data/                   # JSON data files
├── logs/                   # Log files
├── package.json
└── tsconfig.json
```

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

## 🔒 Security

- Use `API_SECRET` for protected endpoints
- CORS configured for main app URL only
- Rate limiting recommended for production

## 📝 Future Improvements

- [ ] Add Redis for caching
- [ ] PostgreSQL for production data
- [ ] More fashion sources (Instagram, Pinterest)
- [ ] Image generation for outfit previews
- [ ] User preference learning
- [ ] A/B testing for outfit suggestions

## 📄 License

MIT License - Klozet © 2024
