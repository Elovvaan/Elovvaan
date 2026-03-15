import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto';
import { ReferralsService } from '../referrals/referrals.service';
import { Session } from '../../database/entities/session.entity';
import { AuditService } from '../../common/audit/audit.service';

interface AccessTokenPayload {
  sub: string;
  email: string;
  isAdmin: boolean;
  role: string;
}

@Injectable()
export class AuthService {
  private readonly accessTokenTtl: string;
  private readonly refreshTokenTtlDays: number;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private referralsService: ReferralsService,
    private configService: ConfigService,
    private auditService: AuditService,
    @InjectRepository(Session) private sessionsRepo: Repository<Session>
  ) {
    this.accessTokenTtl = this.configService.get<string>('JWT_ACCESS_TTL') || '15m';
    this.refreshTokenTtlDays = Number(this.configService.get<string>('JWT_REFRESH_TTL_DAYS') || 30);
  }

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

    await this.auditService.log({ actorUserId: user.id, action: 'auth.register', targetType: 'user', targetId: user.id });
    return this.issueTokens(user.id, user.email, user.isAdmin, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.auditService.log({ actorUserId: user.id, action: 'auth.login', targetType: 'user', targetId: user.id });
    return this.issueTokens(user.id, user.email, user.isAdmin, user.role);
  }

  async refreshSession(refreshToken: string) {
    let decoded: { sub: string; sessionId: string };
    try {
      decoded = this.jwtService.verify<{ sub: string; sessionId: string }>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET')
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.sessionsRepo.findOne({ where: { id: decoded.sessionId }, relations: ['user'] });
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session is invalid or expired');
    }

    const matches = await bcrypt.compare(refreshToken, session.refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    session.revokedAt = new Date();
    await this.sessionsRepo.save(session);

    return this.issueTokens(session.user.id, session.user.email, session.user.isAdmin, session.user.role);
  }

  async logout(refreshToken: string) {
    let decoded: { sessionId: string };
    try {
      decoded = this.jwtService.verify<{ sessionId: string }>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET')
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const session = await this.sessionsRepo.findOne({ where: { id: decoded.sessionId } });
    if (session && !session.revokedAt) {
      session.revokedAt = new Date();
      await this.sessionsRepo.save(session);
    }
    return { ok: true };
  }

  private async issueTokens(userId: string, email: string, isAdmin: boolean, role: string) {
    const payload: AccessTokenPayload = { sub: userId, email, isAdmin, role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: this.accessTokenTtl });

    const session = await this.sessionsRepo.save(
      this.sessionsRepo.create({
        user: { id: userId } as never,
        refreshTokenHash: 'pending',
        expiresAt: new Date(Date.now() + this.refreshTokenTtlDays * 24 * 60 * 60 * 1000)
      })
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, sessionId: session.id },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET'),
        expiresIn: `${this.refreshTokenTtlDays}d`
      }
    );

    session.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.sessionsRepo.save(session);

    return { accessToken, refreshToken, sessionId: session.id };
  }
}
