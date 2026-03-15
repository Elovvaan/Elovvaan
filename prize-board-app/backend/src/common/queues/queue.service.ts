import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RedisService } from '../redis.service';

export interface QueueJob<T> {
  id: string;
  name: string;
  data: T;
  attempts: number;
}

@Injectable()
export class QueueService {
  constructor(private redis: RedisService) {}

  async add<T>(queueName: string, jobName: string, data: T, options?: { jobId?: string }) {
    const id = options?.jobId || `${jobName}:${randomUUID()}`;
    const dedupe = await this.redis.setNx(`job:lock:${id}`, '1', 3600);
    if (!dedupe) {
      return { id };
    }

    const job: QueueJob<T> = { id, name: jobName, data, attempts: 0 };
    await this.redis.getClient().lpush(`queue:${queueName}`, JSON.stringify(job));
    return { id };
  }

  async getNextJob<T>(queueName: string, timeoutSeconds = 1): Promise<QueueJob<T> | null> {
    const result = await this.redis.getClient().brpop(`queue:${queueName}`, timeoutSeconds);
    if (!result) {
      return null;
    }
    return JSON.parse(result[1]) as QueueJob<T>;
  }

  async completeJob(jobId: string, result: unknown) {
    await this.redis.set(`job:result:${jobId}`, JSON.stringify({ ok: true, result }), 120);
  }

  async failJob(jobId: string, error: string) {
    await this.redis.set(`job:result:${jobId}`, JSON.stringify({ ok: false, error }), 120);
  }



  async getQueueDepth(queueName: string) {
    return this.redis.getClient().llen(`queue:${queueName}`);
  }

  async registerWorkerHeartbeat(workerName: string, queueNames: string[]) {
    const key = `worker:heartbeat:${workerName}`;
    await this.redis.set(key, JSON.stringify({ workerName, queueNames, seenAt: new Date().toISOString() }), 30);
    return key;
  }

  async getWorkerHeartbeats() {
    const keys = await this.redis.getKeys('worker:heartbeat:*');
    if (!keys.length) {
      return [] as Array<{ workerName: string; queueNames: string[]; seenAt: string }>;
    }

    const values = await this.redis.getClient().mget(...keys);
    return values.filter(Boolean).map((value) => JSON.parse(String(value)) as { workerName: string; queueNames: string[]; seenAt: string });
  }

  async getRuntimeInfo() {
    const pong = await this.redis.ping();
    return {
      provider: 'redis-list-queue',
      bullmqRuntimeReady: false,
      isRedisReady: pong === 'PONG'
    };
  }

  async waitForCompletion<T>(job: { id: string }, timeoutMs = 10000) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      const payload = await this.redis.get(`job:result:${job.id}`);
      if (payload) {
        const result = JSON.parse(payload) as { ok: boolean; result?: T; error?: string };
        if (!result.ok) {
          throw new Error(result.error || 'Job failed');
        }
        return result.result as T;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error('Job timed out');
  }
}
