import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RedisService } from './common/redis.service';
import { QueueService } from './common/queues/queue.service';
import { ANALYTICS_QUEUE, ENTRY_QUEUE, NOTIFICATION_QUEUE, PAYMENT_QUEUE, WINNER_QUEUE } from './common/queues/queue.constants';

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private redisService: RedisService,
    private queueService: QueueService
  ) {}

  @Get()
  async check() {
    const [dbReady, redisReady, queueReady] = await Promise.all([
      this.checkDb(),
      this.checkRedis(),
      this.checkQueues()
    ]);

    return {
      status: dbReady.ready && redisReady.ready && queueReady.ready ? 'ok' : 'degraded',
      checks: {
        db: dbReady,
        redis: redisReady,
        queue: queueReady
      }
    };
  }

  private async checkDb() {
    try {
      await this.dataSource.query('SELECT 1');
      return { ready: true };
    } catch (error) {
      return { ready: false, error: (error as Error).message };
    }
  }

  private async checkRedis() {
    try {
      const pong = await this.redisService.ping();
      return { ready: pong === 'PONG' };
    } catch (error) {
      return { ready: false, error: (error as Error).message };
    }
  }

  private async checkQueues() {
    try {
      const queueNames = [ENTRY_QUEUE, PAYMENT_QUEUE, WINNER_QUEUE, NOTIFICATION_QUEUE, ANALYTICS_QUEUE];
      const runtime = await this.queueService.getRuntimeInfo();
      const workers = await this.queueService.getWorkerHeartbeats();
      const queueBacklog = await Promise.all(
        queueNames.map(async (name) => ({
          name,
          pending: await this.queueService.getQueueDepth(name)
        }))
      );

      const hasWorkers = workers.length > 0;
      return {
        ready: runtime.isRedisReady && hasWorkers,
        runtime,
        workers,
        queueBacklog,
        workerCount: workers.length,
        error: hasWorkers ? undefined : 'No active workers registered'
      };
    } catch (error) {
      return { ready: false, error: (error as Error).message };
    }
  }
}
