import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('issues access token on register', async () => {
    const usersService = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com', isAdmin: false })
    } as any;
    const jwtService = { sign: jest.fn().mockReturnValue('token') } as unknown as JwtService;
    const service = new AuthService(usersService, jwtService);
    const res = await service.register({ email: 'a@b.com', password: 'password123' });
    expect(res.accessToken).toBe('token');
  });
});
