import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  create(email: string, passwordHash: string) {
    return this.usersRepo.save(this.usersRepo.create({ email, passwordHash }));
  }

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
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
}
