import { CreatorsService } from './creators.service';
import { UserRole } from '../../database/entities/user.entity';

describe('CreatorsService', () => {
  it('returns creator profile stats', async () => {
    const service = new CreatorsService(
      { findOne: jest.fn().mockResolvedValue({ id: 'c1', email: 'c@test.com', role: UserRole.CREATOR, xp: 10, prestigeLevel: 0 }) } as any,
      {
        count: jest.fn().mockResolvedValue(2),
        createQueryBuilder: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ totalEntries: '12' })
        })
      } as any,
      {
        createQueryBuilder: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ totalRevenue: '120.5' })
        })
      } as any
    );

    const profile = await service.getProfile('c1');
    expect(profile.stats.boardsCreated).toBe(2);
    expect(profile.stats.totalRevenue).toBe(120.5);
  });
});
