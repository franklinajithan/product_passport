import { RateLimitError } from "./errors";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

export function enforceRateLimit({ key, limit, windowMs }: RateLimitOptions): void {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (existing.count >= limit) {
    throw new RateLimitError();
  }

  existing.count += 1;
}

export function resetRateLimitStore(): void {
  buckets.clear();
}
