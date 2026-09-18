/**
 * Rate Limiter and Abuse Protection for Kloe AI Assistant
 * Controls request frequency, daily quotas, and token budgets per authenticated user and IP.
 * Daily limits reset strictly at 00:00 Europe/Madrid time.
 */

interface RateLimitRecord {
  timestamps: number[];
  dayCount: number;
  tokensUsedToday: number;
  lastResetDayKey: string; // e.g. "2026-09-18" in Madrid timezone
}

// In-memory store for rate limiting
const userLimits = new Map<string, RateLimitRecord>();
const ipLimits = new Map<string, number[]>();

// Configuration Limits
export const MAX_PER_DAY_FREE = 8;        // 8 daily queries for free tier
export const MAX_PER_DAY_PREMIUM = 35;    // 35 daily queries for Kloe Pro
const MAX_PER_MINUTE_USER = 8;            // Max 8 requests/minute per user (anti-burst)
const MAX_TOKENS_PER_DAY_FREE = 18000;    // Max token budget free
const MAX_TOKENS_PER_DAY_PREMIUM = 80000; // Max token budget premium
const MAX_PER_MINUTE_IP = 20;             // Max 20 requests/minute per IP (anti-scraping)
const ONE_MINUTE_MS = 60 * 1000;

/**
 * Returns current date key formatted as YYYY-MM-DD in Europe/Madrid timezone
 */
export function getMadridDayKey(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Madrid',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remainingMinute: number;
  remainingDay: number;
  dailyLimit: number;
  usedToday: number;
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
 * Gets the current rate limit status for a user without incrementing the counter
 */
export function getUserQuotaStatus(userId: string, isPremium: boolean = false): { usedToday: number; remainingDay: number; dailyLimit: number } {
  const todayKey = getMadridDayKey();
  const maxDay = isPremium ? MAX_PER_DAY_PREMIUM : MAX_PER_DAY_FREE;
  const record = userLimits.get(userId);

  if (!record || record.lastResetDayKey !== todayKey) {
    return {
      usedToday: 0,
      remainingDay: maxDay,
      dailyLimit: maxDay
    };
  }

  return {
    usedToday: record.dayCount,
    remainingDay: Math.max(0, maxDay - record.dayCount),
    dailyLimit: maxDay
  };
}

/**
 * Checks per-user rate limit, burst throttling, and token consumption
 */
export function checkRateLimit(
  userId: string, 
  isPremium: boolean = false, 
  estimatedPromptTokens: number = 200
): RateLimitResult {
  const now = Date.now();
  const todayKey = getMadridDayKey();
  const maxDay = isPremium ? MAX_PER_DAY_PREMIUM : MAX_PER_DAY_FREE;
  const maxTokens = isPremium ? MAX_TOKENS_PER_DAY_PREMIUM : MAX_TOKENS_PER_DAY_FREE;

  let record = userLimits.get(userId);

  if (!record) {
    record = {
      timestamps: [],
      dayCount: 0,
      tokensUsedToday: 0,
      lastResetDayKey: todayKey
    };
    userLimits.set(userId, record);
  }

  // Reset daily quotas if Madrid date rolled over
  if (record.lastResetDayKey !== todayKey) {
    record.dayCount = 0;
    record.tokensUsedToday = 0;
    record.lastResetDayKey = todayKey;
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
      remainingDay: Math.max(0, maxDay - record.dayCount),
      dailyLimit: maxDay,
      usedToday: record.dayCount,
      retryAfterSeconds: Math.max(1, retryAfter),
      reason: 'Has enviado varios mensajes muy rápido. Dame unos segundos para ordenar tus combinaciones y seguimos enseguida.',
      isDailyLimit: false
    };
  }

  // Check daily request count or token budget limit
  if (record.dayCount >= maxDay || record.tokensUsedToday >= maxTokens) {
    const messageReason = isPremium
      ? `Has alcanzado tus ${maxDay} consultas diarias con Kloe. Tu límite se restablecerá a las 00:00 (hora peninsular) para que sigas creando looks increíbles.`
      : `Has alcanzado tus ${maxDay} consultas gratuitas de hoy con Kloe. Tu límite se restablecerá a las 00:00 (hora peninsular), o puedes pasar a Kloe Pro para disfrutar de 35 consultas diarias.`;

    return {
      allowed: false,
      remainingMinute: 0,
      remainingDay: 0,
      dailyLimit: maxDay,
      usedToday: record.dayCount,
      retryAfterSeconds: 3600,
      reason: messageReason,
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
    remainingDay: Math.max(0, maxDay - record.dayCount),
    dailyLimit: maxDay,
    usedToday: record.dayCount,
    isDailyLimit: false
  };
}


