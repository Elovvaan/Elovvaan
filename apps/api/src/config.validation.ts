import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(8),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  RECOMMENDATIONS_DEBUG_LOGS: z.enum(['0', '1']).optional(),
});

export function validateEnv(config: Record<string, unknown>) {
  return envSchema.parse(config);
}
