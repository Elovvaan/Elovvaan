import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly client: Redis;

  constructor(config: ConfigService) {
    this.client = new Redis(config.get<string>('REDIS_URL') || 'redis://localhost:6379');
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
}
