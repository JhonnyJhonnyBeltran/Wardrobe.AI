/**
 * Rate Limiter for CloSy AI Assistant
 * Controls request frequency per authenticated user and IP
 * Prevents abuse and quota exhaustion
 */

interface RateLimitRecord {
  timestamps: number[];
  dayCount: number;
  lastResetDay: number;
}

// In-memory store for rate limiting (persists across server invocations)
const userLimits = new Map<string, RateLimitRecord>();

// Limits configuration
const MAX_PER_MINUTE = 12; // Max 12 requests per minute
const MAX_PER_DAY = 60;    // Max 60 requests per day for standard users
const ONE_MINUTE_MS = 60 * 1000;

export interface RateLimitResult {
  allowed: boolean;
  remainingMinute: number;
  remainingDay: number;
  retryAfterSeconds?: number;
  reason?: string;
}

export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const today = Math.floor(now / (24 * 60 * 60 * 1000));

  let record = userLimits.get(identifier);

  if (!record) {
    record = {
      timestamps: [],
      dayCount: 0,
      lastResetDay: today
    };
    userLimits.set(identifier, record);
  }

  // Reset daily count if day rolled over
  if (record.lastResetDay !== today) {
    record.dayCount = 0;
    record.lastResetDay = today;
  }

  // Filter timestamps to last 60 seconds
  record.timestamps = record.timestamps.filter(ts => now - ts < ONE_MINUTE_MS);

  // Check minute limit
  if (record.timestamps.length >= MAX_PER_MINUTE) {
    const oldest = record.timestamps[0];
    const retryAfter = Math.ceil((oldest + ONE_MINUTE_MS - now) / 1000);
    return {
      allowed: false,
      remainingMinute: 0,
      remainingDay: Math.max(0, MAX_PER_DAY - record.dayCount),
      retryAfterSeconds: Math.max(1, retryAfter),
      reason: 'Has enviado demasiados mensajes seguidos. Por favor espera unos segundos.'
    };
  }

  // Check daily limit
  if (record.dayCount >= MAX_PER_DAY) {
    return {
      allowed: false,
      remainingMinute: 0,
      remainingDay: 0,
      retryAfterSeconds: 3600,
      reason: 'Has alcanzado el límite diario de consultas con CloSy AI. Vuelve mañana para más estilismos.'
    };
  }

  // Record this request
  record.timestamps.push(now);
  record.dayCount += 1;

  return {
    allowed: true,
    remainingMinute: MAX_PER_MINUTE - record.timestamps.length,
    remainingDay: MAX_PER_DAY - record.dayCount
  };
}
