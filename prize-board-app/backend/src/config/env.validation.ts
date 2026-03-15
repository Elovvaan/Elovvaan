const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

export function validateEnv(config: Record<string, unknown>) {
  const missing = requiredEnvVars.filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (!config.REDIS_URL && !config.QUEUE_REDIS_URL) {
    throw new Error('Missing required environment variables: provide REDIS_URL or QUEUE_REDIS_URL');
  }

  const jwtSecret = String(config.JWT_SECRET || '');
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  return config;
}
