import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async create(email: string, passwordHash: string) {
    return this.usersRepo.save(this.usersRepo.create({ email, passwordHash, referralCode: this.generateReferralCode() }));
  }

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  findByReferralCode(referralCode: string) {
    return this.usersRepo.findOne({ where: { referralCode } });
  }

  leaderboard(limit = 50) {
    return this.usersRepo.find({ select: ['id', 'email', 'xp', 'prestigeLevel', 'referralCode'], order: { xp: 'DESC' }, take: limit });
  }

  async awardXp(userId: string, delta: number) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.xp += delta;
    user.prestigeLevel = Math.floor(user.xp / 1000);
    return this.usersRepo.save(user);
  }

  private generateReferralCode() {
    return randomBytes(4).toString('hex').toUpperCase();
  }
}
