import { Global, Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { RedisService } from '../redis.service';

@Global()
@Module({
  providers: [RedisService, QueueService],
  exports: [QueueService, RedisService]
})
export class QueueModule {}
