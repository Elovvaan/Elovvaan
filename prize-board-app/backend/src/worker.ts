import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ENTRY_QUEUE, PAYMENT_QUEUE, WINNER_QUEUE } from './common/queues/queue.constants';
import { QueueService } from './common/queues/queue.service';
import { EntriesService } from './modules/entries/entries.service';
import { PaymentsService } from './modules/payments/payments.service';

async function bootstrapWorkers() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const queueService = app.get(QueueService);
  const entriesService = app.get(EntriesService);
  const paymentsService = app.get(PaymentsService);

  const loop = async (queueName: string, handler: (data: any) => Promise<unknown>) => {
    while (true) {
      const job = await queueService.getNextJob<any>(queueName, 1);
      if (!job) {
        continue;
      }

      try {
        const result = await handler(job.data);
        await queueService.completeJob(job.id, result);
      } catch (error) {
        await queueService.failJob(job.id, (error as Error).message);
      }
    }
  };

  void loop(ENTRY_QUEUE, (data) => entriesService.processEntryJob(data));
  void loop(PAYMENT_QUEUE, (data) => paymentsService.processPaymentJob(data));
  void loop(WINNER_QUEUE, (data) => entriesService.processWinnerJob(data.boardId));
}

bootstrapWorkers();
