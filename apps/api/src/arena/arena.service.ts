import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ArenaService {
  constructor(private prisma: PrismaService) {}

  async feed(userId?: string) {
    const [trendingBoards, openChallenges, featured] = await Promise.all([
      this.prisma.board.findMany({ where: { status: 'OPEN' }, orderBy: { filledSpots: 'desc' }, take: 6 }),
      this.prisma.challenge.findMany({ where: { status: 'OPEN' }, orderBy: { createdAt: 'desc' }, take: 6 }),
      this.prisma.featuredContent.findMany({ where: { isActive: true }, orderBy: { weight: 'desc' }, take: 5 }),
    ]);

    return {
      trending: trendingBoards,
      liveNow: openChallenges,
      openChallenges,
      highPrize: [...trendingBoards].sort((a, b) => Number(b.prizePool) - Number(a.prizePool)).slice(0, 5),
      recommendedForYou: userId ? openChallenges.slice(0, 3) : [],
      featured,
    };
  }
}
