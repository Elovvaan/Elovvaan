import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto';
import { ReferralsService } from '../referrals/referrals.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private referralsService: ReferralsService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email is already in use');
    }

    const user = await this.usersService.create(dto.email, await bcrypt.hash(dto.password, 10));

    if (dto.referralCode) {
      const referrer = await this.usersService.findByReferralCode(dto.referralCode);
      if (referrer && referrer.id !== user.id) {
        await this.referralsService.createReferral(referrer.id, user.id);
      }
    }

    return this.issueToken(user.id, user.email, user.isAdmin);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueToken(user.id, user.email, user.isAdmin);
  }

  private issueToken(userId: string, email: string, isAdmin: boolean) {
    return { accessToken: this.jwtService.sign({ sub: userId, email, isAdmin }) };
  }
}
