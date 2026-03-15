import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueueService } from '../../common/queues/queue.service';
import { ANALYTICS_QUEUE } from '../../common/queues/queue.constants';
import { AnalyticsEvent } from '../../database/entities/analytics-event.entity';
import { DailyMetric } from '../../database/entities/daily-metric.entity';

interface AnalyticsEventPayload {
  eventName: string;
  userId?: string;
  boardId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent) private analyticsEventsRepo: Repository<AnalyticsEvent>,
    @InjectRepository(DailyMetric) private dailyMetricsRepo: Repository<DailyMetric>,
    private queueService: QueueService
  ) {}

  async track(event: AnalyticsEventPayload) {
    await this.analyticsEventsRepo.save(this.analyticsEventsRepo.create({ ...event, metadata: event.metadata || {} }));
  }

  enqueueDailyAggregation(day: string) {
    return this.queueService.add(ANALYTICS_QUEUE, 'aggregate-daily-metrics', { day }, { jobId: `analytics:${day}` });
  }

  async processDailyAggregationJob(day: string) {
    const [entriesCount, paymentsSuccessCount, boardsFullCount, winnersSelectedCount, grossRevenue] = await Promise.all([
      this.analyticsEventsRepo.count({ where: { eventName: 'entry_added' } }),
      this.analyticsEventsRepo.count({ where: { eventName: 'payment_succeeded' } }),
      this.analyticsEventsRepo.count({ where: { eventName: 'board_full' } }),
      this.analyticsEventsRepo.count({ where: { eventName: 'winner_selected' } }),
      this.analyticsEventsRepo
        .createQueryBuilder('event')
        .select("COALESCE(SUM((event.metadata->>'amount')::numeric),0)", 'sum')
        .where('event.eventName = :eventName', { eventName: 'payment_succeeded' })
        .getRawOne<{ sum: string }>()
        .then((row) => Number(row?.sum || 0))
    ]);

    const existing = await this.dailyMetricsRepo.findOne({ where: { day } });
    const metric = existing || this.dailyMetricsRepo.create({ day });
    metric.entriesCount = entriesCount;
    metric.paymentsSuccessCount = paymentsSuccessCount;
    metric.boardsFullCount = boardsFullCount;
    metric.winnersSelectedCount = winnersSelectedCount;
    metric.grossRevenue = grossRevenue;
    return this.dailyMetricsRepo.save(metric);
  }
}
