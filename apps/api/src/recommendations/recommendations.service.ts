import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  async getHome(userId: string) {
    const [boards, challenges, profile, prefs] = await Promise.all([
      this.prisma.board.findMany({ where: { status: 'OPEN' }, include: { category: true } }),
      this.prisma.challenge.findMany({ where: { status: 'OPEN' }, include: { category: true } }),
      this.prisma.userSkillProfile.findUnique({ where: { userId } }),
      this.prisma.userPreference.findUnique({ where: { userId } }),
    ]);

    const rankedBoards = boards
      .map((b) => ({
        ...b,
        recScore: this.scoreItem(Number(b.entryFee), Number(b.prizePool), b.categoryId, prefs?.preferredCategoryIds ?? [], profile?.avgEntryFee ?? 10),
      }))
      .sort((a, b) => b.recScore - a.recScore)
      .slice(0, 10);

    const rankedChallenges = challenges
      .map((c) => ({
        ...c,
        recScore: this.scoreItem(Number(c.entryFee), Number(c.prizePool), c.categoryId, prefs?.preferredCategoryIds ?? [], profile?.avgEntryFee ?? 10),
      }))
      .sort((a, b) => b.recScore - a.recScore)
      .slice(0, 10);

    return { rankedBoards, rankedChallenges };
  }

  recommendedBoards(userId: string) {
    return this.getHome(userId).then((x) => x.rankedBoards);
  }

  recommendedChallenges(userId: string) {
    return this.getHome(userId).then((x) => x.rankedChallenges);
  }

  private scoreItem(entryFee: number, prizePool: number, categoryId: string, preferredCategories: string[], comfortFee: number) {
    const categoryMatch = preferredCategories.includes(categoryId) ? 30 : 0;
    const entryFit = Math.max(0, 30 - Math.abs(entryFee - comfortFee) * 2);
    const prizeRelevance = Math.min(30, prizePool / 10);
    const urgency = 10;
    return categoryMatch + entryFit + prizeRelevance + urgency;
  }
}
