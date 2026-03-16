export type RecommendationType = 'BOARD' | 'CHALLENGE';

export type RecommendationItem = {
  id: string;
  title?: string;
  name?: string;
  category?: { id?: string; name?: string };
};

export type FeedItem = {
  type: RecommendationType;
  score: number;
  item: RecommendationItem;
};

export type HomeRecommendationsResponse = {
  feed: FeedItem[];
};

export function coerceFeedItem(input: unknown): FeedItem | null {
  if (!input || typeof input !== 'object') return null;
  const candidate = input as Record<string, unknown>;
  const type = candidate.type;
  const score = candidate.score;
  const item = candidate.item;

  if ((type !== 'BOARD' && type !== 'CHALLENGE') || typeof score !== 'number' || !item || typeof item !== 'object') {
    return null;
  }

  const rawItem = item as Record<string, unknown>;
  if (typeof rawItem.id !== 'string' || !rawItem.id.trim()) return null;

  const category = rawItem.category && typeof rawItem.category === 'object'
    ? {
        id: typeof (rawItem.category as Record<string, unknown>).id === 'string' ? (rawItem.category as Record<string, unknown>).id as string : undefined,
        name: typeof (rawItem.category as Record<string, unknown>).name === 'string' ? (rawItem.category as Record<string, unknown>).name as string : undefined,
      }
    : undefined;

  return {
    type,
    score,
    item: {
      id: rawItem.id,
      title: typeof rawItem.title === 'string' ? rawItem.title : undefined,
      name: typeof rawItem.name === 'string' ? rawItem.name : undefined,
      category,
    },
  };
}

export function coerceHomeRecommendations(input: unknown): HomeRecommendationsResponse {
  if (!input || typeof input !== 'object') return { feed: [] };
  const rawFeed = (input as Record<string, unknown>).feed;
  if (!Array.isArray(rawFeed)) return { feed: [] };

  const feed = rawFeed.map(coerceFeedItem).filter((item): item is FeedItem => Boolean(item));
  return { feed };
}
