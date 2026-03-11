import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral } from '../../database/entities/referral.entity';

@Injectable()
export class ReferralsService {
  constructor(@InjectRepository(Referral) private referralsRepo: Repository<Referral>) {}

  async createReferral(referrerUserId: string, referredUserId: string) {
    const existing = await this.referralsRepo.findOne({ where: { referrerUserId, referredUserId } });
    if (existing) {
      return existing;
    }

    return this.referralsRepo.save(this.referralsRepo.create({ referrerUserId, referredUserId }));
  }

  findByReferredUser(referredUserId: string) {
    return this.referralsRepo.findOne({ where: { referredUserId } });
  }
}
