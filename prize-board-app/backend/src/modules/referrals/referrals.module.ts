import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Referral } from '../../database/entities/referral.entity';
import { ReferralsService } from './referrals.service';

@Module({
  imports: [TypeOrmModule.forFeature([Referral])],
  providers: [ReferralsService],
  exports: [ReferralsService]
})
export class ReferralsModule {}
