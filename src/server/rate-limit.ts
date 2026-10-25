import "server-only";

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding window cache
const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of expired entries (every 5 minutes)
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 86400000); // 24 hours max
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 300000);

  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

/**
 * Checks a rate limit key against an allowed threshold within a sliding time window.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  // Filter timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetTime = oldest + windowMs;
    return {
      allowed: false,
      remaining: 0,
      resetTime,
    };
  }

  // Record this request
  record.timestamps.push(now);

  return {
    allowed: true,
    remaining: limit - record.timestamps.length,
    resetTime: now + windowMs,
  };
}

/**
 * Public Verification lookup rate limit: 60 requests / minute / IP
 */
export function checkVerifyRateLimit(ip: string) {
  const key = `verify:${ip || "unknown"}`;
  return checkRateLimit(key, 60, 60000);
}

/**
 * Rate-limited PDF redirect download rate limit: 60 requests / minute / IP
 */
export function checkDownloadRateLimit(ip: string) {
  const key = `download:${ip || "unknown"}`;
  return checkRateLimit(key, 60, 60000);
}

/**
 * Test Certificate preview rate limit: 5 test certificates / day / org (TRD §14)
 */
export function checkTestCertRateLimit(orgId: string) {
  const key = `test_cert:${orgId}`;
  return checkRateLimit(key, 5, 86400000); // 24 hours
}

/**
 * Authentication attempt rate limit: 5 requests / minute / identifier
 */
export function checkAuthRateLimit(identifier: string) {
  const key = `auth:${identifier.toLowerCase().trim()}`;
  return checkRateLimit(key, 5, 60000);
}

/**
 * File upload rate limit: 20 uploads / hour / user
 */
export function checkUploadRateLimit(userId: string) {
  const key = `upload:${userId}`;
  return checkRateLimit(key, 20, 3600000);
}

/**
 * Clears the rate limit store (used for test setup/teardown).
 */
export function resetRateLimits() {
  rateLimitStore.clear();
}
