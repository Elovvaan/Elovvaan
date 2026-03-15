import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('issues access and refresh tokens on register', async () => {
    const usersService = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com', isAdmin: false, role: 'USER' })
    } as any;
    const jwtService = { sign: jest.fn().mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token') } as unknown as JwtService;
    const referralsService = { createReferral: jest.fn() } as any;
    const configService = { get: jest.fn().mockImplementation((key: string) => (key === 'JWT_REFRESH_TTL_DAYS' ? '30' : undefined)) } as any;
    const auditService = { log: jest.fn().mockResolvedValue(undefined) } as any;
    const sessionsRepo = {
      save: jest
        .fn()
        .mockResolvedValueOnce({ id: 's1', user: { id: 'u1' } })
        .mockResolvedValueOnce({ id: 's1', user: { id: 'u1' }, refreshTokenHash: 'hash' }),
      create: jest.fn().mockImplementation((arg) => arg)
    } as any;

    const service = new AuthService(usersService, jwtService, referralsService, configService, auditService, sessionsRepo);
    const res = await service.register({ email: 'a@b.com', password: 'password123' });

    expect(res.accessToken).toBe('access-token');
    expect(res.refreshToken).toBe('refresh-token');
    expect(sessionsRepo.save).toHaveBeenCalledTimes(2);
  });
});
