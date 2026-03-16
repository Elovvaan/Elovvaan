import { z } from 'zod';

const categorySchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .passthrough();

const boardRecommendationSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    categoryId: z.string(),
    recScore: z.number(),
    category: categorySchema.optional(),
  })
  .passthrough();

const challengeRecommendationSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    categoryId: z.string(),
    recScore: z.number(),
    rivalryStrength: z.number().optional(),
    category: categorySchema.optional(),
  })
  .passthrough();

const feedItemSchema = z
  .object({
    type: z.enum(['BOARD', 'CHALLENGE']),
    score: z.number(),
    item: z.record(z.unknown()),
  })
  .passthrough();

export const recommendationsHomeResponseSchema = z.object({
  metrics: z.record(z.unknown()),
  feed: z.array(feedItemSchema),
  rankedBoards: z.array(boardRecommendationSchema),
  rankedChallenges: z.array(challengeRecommendationSchema),
});

export const recommendationsBoardsResponseSchema = z.array(boardRecommendationSchema);
export const recommendationsChallengesResponseSchema = z.array(challengeRecommendationSchema);
