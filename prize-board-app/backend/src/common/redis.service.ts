import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(config: ConfigService) {
    const queueRedisUrl = config.get<string>('QUEUE_REDIS_URL') || process.env.QUEUE_REDIS_URL;
    const redisUrl = config.get<string>('REDIS_URL') || process.env.REDIS_URL;
    const resolvedRedisUrl = queueRedisUrl || redisUrl;
    const nodeEnv = config.get<string>('NODE_ENV') || process.env.NODE_ENV || 'development';
    const isProduction = nodeEnv === 'production';

    if (!resolvedRedisUrl) {
      if (isProduction) {
        throw new Error(
          'Redis URL is not configured in production. Set QUEUE_REDIS_URL (preferred) or REDIS_URL before startup.'
        );
      }

      this.logger.warn('Redis URL is not set. Configure QUEUE_REDIS_URL or REDIS_URL. Falling back to redis://localhost:6379');
    }

    const redisConnectionUrl = resolvedRedisUrl || 'redis://localhost:6379';

    this.client = new Redis(redisConnectionUrl);

    this.client.on('connect', () => {
      this.logger.log(`Connected to Redis at ${this.sanitizeRedisUrl(redisConnectionUrl)}`);
    });

    this.client.on('error', (error) => {
      this.logger.error(
        `Redis connection error for ${this.sanitizeRedisUrl(redisConnectionUrl)}: ${error.message}`,
        error.stack
      );
    });
  }

  getClient() {
    return this.client;
  }

  get(key: string) {
    return this.client.get(key);
  }

  set(key: string, value: string, ttlSeconds = 30) {
    return this.client.set(key, value, 'EX', ttlSeconds);
  }

  del(...keys: string[]) {
    return this.client.del(...keys);
  }

  async setNx(key: string, value: string, ttlSeconds: number) {
    const result = await this.client.set(key, value, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async incrementBy(key: string, delta = 1, ttlSeconds?: number) {
    const value = await this.client.incrby(key, delta);
    if (ttlSeconds) {
      await this.client.expire(key, ttlSeconds);
    }
    return value;
  }

  private sanitizeRedisUrl(url: string) {
    try {
      const parsed = new URL(url);
      if (parsed.password) {
        parsed.password = '***';
      }
      return parsed.toString();
    } catch {
      return url;
    }
  }
}
