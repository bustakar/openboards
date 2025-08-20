type Window = {
  hits: number[]; // epoch ms timestamps
};

const globalStore = globalThis as unknown as { __rate__: Map<string, Window> };
if (!globalStore.__rate__) {
  globalStore.__rate__ = new Map();
}

function getWindow(key: string): Window {
  const store = globalStore.__rate__;
  let w = store.get(key);
  if (!w) {
    w = { hits: [] };
    store.set(key, w);
  }
  return w;
}

export function checkAndRecordLimit(
  key: string,
  limit: number,
  windowMs: number
): {
  allowed: boolean;
  remaining: number;
  resetMs: number;
} {
  // Disable rate limiting in development for easier local testing
  if (process.env.NODE_ENV !== 'production') {
    return { allowed: true, remaining: limit, resetMs: 0 };
  }
  const now = Date.now();
  const w = getWindow(key);
  // drop old
  w.hits = w.hits.filter((t) => now - t < windowMs);
  if (w.hits.length >= limit) {
    const resetMs = windowMs - (now - w.hits[0]);
    return { allowed: false, remaining: 0, resetMs };
  }
  w.hits.push(now);
  return {
    allowed: true,
    remaining: Math.max(0, limit - w.hits.length),
    resetMs: windowMs,
  };
}
