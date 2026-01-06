type PollHash = Record<string, string>;

interface PollStore {
  hgetall<T extends PollHash>(key: string): Promise<T | null>;
  hincrby(key: string, field: string, increment: number): Promise<number>;
}

const mockData = new Map<string, Record<string, number>>();

export const mockPollStore: PollStore & { reset: () => void } = {
  async hgetall<T extends PollHash>(key: string): Promise<T | null> {
    const data = mockData.get(key);
    if (!data) return null;

    const serialized = Object.fromEntries(
      Object.entries(data).map(([field, value]) => [field, String(value)])
    );

    return serialized as T;
  },
  async hincrby(key: string, field: string, increment: number): Promise<number> {
    const data = mockData.get(key) ?? {};
    const next = (data[field] ?? 0) + increment;
    data[field] = next;
    mockData.set(key, data);
    return next;
  },
  reset() {
    mockData.clear();
  },
};

// Lazy-load Vercel KV only when env vars are set (avoids import error in dev)
function createPollStore(): PollStore {
  if (process.env.KV_REST_API_URL) {
    // Dynamic require to avoid import error when env vars missing
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { kv } = require('@vercel/kv');
    return kv;
  }
  return mockPollStore;
}

export const pollStore: PollStore = createPollStore();
