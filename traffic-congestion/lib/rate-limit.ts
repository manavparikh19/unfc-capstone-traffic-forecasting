type Bucket = {
  count: number;
  expiresAt: number;
};

const store = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.expiresAt <= now) {
    store.set(key, { count: 1, expiresAt: now + windowMs });
    return {
      allowed: true,
      remaining: maxRequests - 1,
    };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: entry.expiresAt - now,
    };
  }

  entry.count += 1;
  store.set(key, entry);

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
  };
}
