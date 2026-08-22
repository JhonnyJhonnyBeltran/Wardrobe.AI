/**
 * Rate Limiter and Abuse Protection for Klosy AI Assistant
 * Controls request frequency, daily quotas, and token budgets per authenticated user and IP.
 */

interface RateLimitRecord {
  timestamps: number[];
  dayCount: number;
  tokensUsedToday: number;
  lastResetDay: number;
}

// In-memory store for rate limiting
const userLimits = new Map<string, RateLimitRecord>();
const ipLimits = new Map<string, number[]>();

// Configuration Limits
const MAX_PER_MINUTE_USER = 8;    // Max 8 requests/minute per user
const MAX_PER_DAY_USER = 30;       // Max 30 requests/day per user (to maintain margins & quality)
const MAX_TOKENS_PER_DAY = 60000;  // Max estimated tokens/day per user
const MAX_PER_MINUTE_IP = 15;      // Max 15 requests/minute per IP (anti-DDoS/scraping)
const ONE_MINUTE_MS = 60 * 1000;

export interface RateLimitResult {
  allowed: boolean;
  remainingMinute: number;
  remainingDay: number;
  retryAfterSeconds?: number;
  reason?: string;
  isDailyLimit?: boolean;
}

/**
 * Checks IP level rate limiting to protect against unauthenticated / script attacks
 */
export function checkIpRateLimit(ip: string): boolean {
  if (!ip || ip === 'unknown') return true;
  const now = Date.now();
  let timestamps = ipLimits.get(ip) || [];
  timestamps = timestamps.filter(ts => now - ts < ONE_MINUTE_MS);

  if (timestamps.length >= MAX_PER_MINUTE_IP) {
    return false;
  }

  timestamps.push(now);
  ipLimits.set(ip, timestamps);
  return true;
}

/**
 * Checks per-user rate limit, burst throttling, and token consumption
 */
export function checkRateLimit(userId: string, estimatedPromptTokens: number = 200): RateLimitResult {
  const now = Date.now();
  const today = Math.floor(now / (24 * 60 * 60 * 1000));

  let record = userLimits.get(userId);

  if (!record) {
    record = {
      timestamps: [],
      dayCount: 0,
      tokensUsedToday: 0,
      lastResetDay: today
    };
    userLimits.set(userId, record);
  }

  // Reset daily quotas if day rolled over
  if (record.lastResetDay !== today) {
    record.dayCount = 0;
    record.tokensUsedToday = 0;
    record.lastResetDay = today;
  }

  // Filter minute timestamps
  record.timestamps = record.timestamps.filter(ts => now - ts < ONE_MINUTE_MS);

  // Check burst minute limit
  if (record.timestamps.length >= MAX_PER_MINUTE_USER) {
    const oldest = record.timestamps[0];
    const retryAfter = Math.ceil((oldest + ONE_MINUTE_MS - now) / 1000);
    return {
      allowed: false,
      remainingMinute: 0,
      remainingDay: Math.max(0, MAX_PER_DAY_USER - record.dayCount),
      retryAfterSeconds: Math.max(1, retryAfter),
      reason: 'Has enviado varios mensajes muy rápido. Dame unos segundos para ordenar tus combinaciones y seguimos enseguida.',
      isDailyLimit: false
    };
  }

  // Check daily request count or token budget limit (30 messages/day)
  if (record.dayCount >= MAX_PER_DAY_USER || record.tokensUsedToday >= MAX_TOKENS_PER_DAY) {
    return {
      allowed: false,
      remainingMinute: 0,
      remainingDay: 0,
      retryAfterSeconds: 3600,
      reason: 'Has agotado tus 30 mensajes diarios con Kloe. Tu límite se restablecerá mañana a las 00:00 para que puedas seguir creando looks increíbles.',
      isDailyLimit: true
    };
  }

  // Record this request and estimate token usage
  record.timestamps.push(now);
  record.dayCount += 1;
  record.tokensUsedToday += estimatedPromptTokens;

  return {
    allowed: true,
    remainingMinute: MAX_PER_MINUTE_USER - record.timestamps.length,
    remainingDay: Math.max(0, MAX_PER_DAY_USER - record.dayCount),
    isDailyLimit: false
  };
}

