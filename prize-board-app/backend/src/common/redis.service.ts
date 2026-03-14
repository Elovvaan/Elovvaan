import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(config: ConfigService) {
    const redisUrl =
      config.get<string>('QUEUE_REDIS_URL') ||
      config.get<string>('REDIS_URL') ||
      process.env.QUEUE_REDIS_URL ||
      process.env.REDIS_URL;

    if (!redisUrl) {
      this.logger.warn('Redis URL is not set. Configure QUEUE_REDIS_URL or REDIS_URL. Falling back to redis://localhost:6379');
    }

    const resolvedRedisUrl = redisUrl || 'redis://localhost:6379';

    this.client = new Redis(resolvedRedisUrl);

    this.client.on('connect', () => {
      this.logger.log(`Connected to Redis at ${this.sanitizeRedisUrl(resolvedRedisUrl)}`);
    });

    this.client.on('error', (error) => {
      this.logger.error(
        `Redis connection error for ${this.sanitizeRedisUrl(resolvedRedisUrl)}: ${error.message}`,
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
