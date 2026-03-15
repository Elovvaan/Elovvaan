import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsEvent } from '../../database/entities/analytics-event.entity';
import { DailyMetric } from '../../database/entities/daily-metric.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AnalyticsEvent, DailyMetric])],
  providers: [AnalyticsService],
  exports: [AnalyticsService]
})
export class AnalyticsModule {}
