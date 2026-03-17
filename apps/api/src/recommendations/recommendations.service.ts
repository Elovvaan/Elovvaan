import { Injectable, Logger } from '@nestjs/common';
import { BehaviorEventType, ChallengeStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);
  private readonly isDev = process.env.NODE_ENV === 'development';
  private readonly verboseDebugLogs = process.env.RECOMMENDATIONS_DEBUG_LOGS === '1';

  constructor(private prisma: PrismaService) {}

  async getHome(userId: string) {
    const metrics = await this.computeUserMetrics(userId);
    const [rankedBoards, rankedChallenges] = await Promise.all([this.recommendedBoards(userId, metrics), this.recommendedChallenges(userId, metrics)]);

    this.logger.debug(`Home recommendations computed user=${userId} boards=${rankedBoards.length} challenges=${rankedChallenges.length}`);
    if (this.isDev && this.verboseDebugLogs) {
      const preview = [...rankedBoards.map((b) => `BOARD:${b.id}:${b.recScore}`), ...rankedChallenges.map((c) => `CHALLENGE:${c.id}:${c.recScore}`)]
        .sort((a, b) => Number(b.split(':')[2]) - Number(a.split(':')[2]))
        .slice(0, 5)
        .join(', ');
      this.logger.debug(`Recommendation score preview user=${userId} top5=[${preview}]`);
    }

    return {
      metrics,
      feed: [
        ...rankedBoards.map((board) => ({ type: 'BOARD' as const, score: board.recScore, item: board })),
        ...rankedChallenges.map((challenge) => ({ type: 'CHALLENGE' as const, score: challenge.recScore, item: challenge })),
      ]
        .sort((a, b) => b.score - a.score)
        .slice(0, 24),
      rankedBoards,
      rankedChallenges,
    };
  }

  async getHomeDebug(userId: string) {
    const metrics = await this.computeUserMetrics(userId);
    const [boards, challenges] = await Promise.all([
      this.recommendedBoards(userId, metrics, { includeBreakdown: true }),
      this.recommendedChallenges(userId, metrics, { includeBreakdown: true }),
    ]);

    const rankedFeed = [
      ...boards.map((board) => ({
        rankType: 'BOARD' as const,
        id: board.id,
        categoryId: board.categoryId,
        score: board.recScore,
        breakdown: board.scoreBreakdown,
      })),
      ...challenges.map((challenge) => ({
        rankType: 'CHALLENGE' as const,
        id: challenge.id,
        categoryId: challenge.categoryId,
        score: challenge.recScore,
        breakdown: challenge.scoreBreakdown,
      })),
    ]
      .sort((a, b) => b.score - a.score)
      .slice(0, 24)
      .map((item, index) => ({ rank: index + 1, ...item }));

    return {
      generatedAt: new Date().toISOString(),
      metrics,
      rankedFeed,
      rankedBoards: boards.map((board, index) => ({ rank: index + 1, ...board })),
      rankedChallenges: challenges.map((challenge, index) => ({ rank: index + 1, ...challenge })),
    };
  }

  async recommendedBoards(
    userId: string,
    precomputedMetrics?: Awaited<ReturnType<RecommendationsService['computeUserMetrics']>>,
    options?: { includeBreakdown?: boolean },
  ) {
    const [boards, metrics] = await Promise.all([
      this.prisma.board.findMany({
        where: { status: 'OPEN' },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      precomputedMetrics ?? this.computeUserMetrics(userId),
    ]);

    return boards
      .map((board) => {
        const scoreDetails = this.computeBoardRecommendationScore({
          categoryId: board.categoryId,
          entryFee: Number(board.entryFee),
          prizePool: Number(board.prizePool),
          fillRatio: board.spotCount > 0 ? board.filledSpots / board.spotCount : 0,
          userMetrics: metrics,
        });

        return {
          ...board,
          recScore: scoreDetails.total,
          ...(options?.includeBreakdown ? { scoreBreakdown: scoreDetails } : {}),
        };
      })
      .sort((a, b) => b.recScore - a.recScore)
      .slice(0, 20);
  }

  async recommendedChallenges(
    userId: string,
    precomputedMetrics?: Awaited<ReturnType<RecommendationsService['computeUserMetrics']>>,
    options?: { includeBreakdown?: boolean },
  ) {
    const [challenges, metrics] = await Promise.all([
      this.prisma.challenge.findMany({
        where: { status: ChallengeStatus.OPEN, participants: { none: { userId } } },
        include: { category: true, participants: true },
        orderBy: { createdAt: 'desc' },
        take: 75,
      }),
      precomputedMetrics ?? this.computeUserMetrics(userId),
    ]);

    const scored = challenges
      .map((challenge) => {
        const rivalryStrength = this.getRivalryStrengthAgainst(challenge.creatorId, metrics.rivalries);
        const boardScoreDetails = this.computeBoardRecommendationScore({
          categoryId: challenge.categoryId,
          entryFee: Number(challenge.entryFee),
          prizePool: Number(challenge.prizePool),
          fillRatio: Math.min(challenge.participants.length / 2, 1),
          userMetrics: metrics,
        });
        const scoreDetails = this.computeChallengeRecommendationScore({
          categoryId: challenge.categoryId,
          entryFee: Number(challenge.entryFee),
          prizePool: Number(challenge.prizePool),
          participantCount: challenge.participants.length,
          acceptanceRate: metrics.acceptanceRate,
          rivalryStrength,
          boardScore: boardScoreDetails.total,
        });

        return {
          ...challenge,
          recScore: scoreDetails.total,
          rivalryStrength,
          ...(options?.includeBreakdown ? { scoreBreakdown: { ...scoreDetails, boardScoreBreakdown: boardScoreDetails } } : {}),
        };
      })
      .sort((a, b) => b.recScore - a.recScore)
      .slice(0, 20);

    try {
      await this.persistChallengeRecommendations(
        userId,
        scored.map((challenge) => ({
          challengeId: challenge.id,
          score: challenge.recScore,
          reason: this.buildChallengeReason(challenge.recScore, challenge.rivalryStrength, metrics.acceptanceRate),
        })),
      );
    } catch (error) {
      this.logger.warn(`Failed to persist challenge recommendations user=${userId}: ${error instanceof Error ? error.message : 'unknown error'}`);
    }

    return scored;
  }


  async resetDerivedRecommendationState(userId: string) {
    const [skillProfiles, preferences, recommendationRows, rivalriesA, rivalriesB, matchmakingRows] = await this.prisma.$transaction([
      this.prisma.userSkillProfile.deleteMany({ where: { userId } }),
      this.prisma.userPreference.deleteMany({ where: { userId } }),
      this.prisma.challengeRecommendation.deleteMany({ where: { userId } }),
      this.prisma.userRivalry.deleteMany({ where: { userAId: userId } }),
      this.prisma.userRivalry.deleteMany({ where: { userBId: userId } }),
      this.prisma.matchmakingScore.deleteMany({ where: { userId } }),
    ]);

    this.logger.debug(
      `Reset derived recommendation state user=${userId} skillProfiles=${skillProfiles.count} preferences=${preferences.count} challengeRecommendations=${recommendationRows.count} rivalries=${rivalriesA.count + rivalriesB.count} matchmaking=${matchmakingRows.count}`,
    );

    return {
      userId,
      deleted: {
        userSkillProfile: skillProfiles.count,
        userPreference: preferences.count,
        challengeRecommendation: recommendationRows.count,
        userRivalry: rivalriesA.count + rivalriesB.count,
        matchmakingScore: matchmakingRows.count,
      },
    };
  }

  async logBehaviorEvent(userId: string, input: { eventType: BehaviorEventType; itemType: string; itemId: string; metadata?: unknown }) {
    const sanitizedMetadata = input.metadata && typeof input.metadata === 'object' ? (input.metadata as Record<string, unknown>) : undefined;

    this.logger.debug(`Behavior event user=${userId} type=${input.eventType} itemType=${input.itemType} itemId=${input.itemId}`);

    return this.prisma.userBehaviorEvent.create({
      data: {
        userId,
        eventType: input.eventType,
        itemType: input.itemType,
        itemId: input.itemId,
        metadata: sanitizedMetadata,
      },
    });
  }

  private async computeUserMetrics(userId: string) {
    const [profile, challengeHistory, boardEntries, behaviorEvents, storedPref, storedSkill, rivalries] = await Promise.all([
      this.prisma.profile.findUnique({ where: { userId } }),
      this.prisma.challenge.findMany({
        where: { participants: { some: { userId } } },
        include: { result: true, participants: true },
      }),
      this.prisma.boardEntry.findMany({ where: { userId }, include: { board: true } }),
      this.prisma.userBehaviorEvent.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 200 }),
      this.prisma.userPreference.findUnique({ where: { userId } }),
      this.prisma.userSkillProfile.findUnique({ where: { userId } }),
      this.prisma.userRivalry.findMany({ where: { OR: [{ userAId: userId }, { userBId: userId }] } }),
    ]);

    const skillScore = this.calculateSkillScore(profile?.wins ?? 0, profile?.losses ?? 0, challengeHistory.length);
    const categoryPreference = this.calculateCategoryPreference({ behaviorEvents, boardEntries, challengeHistory });
    const comfortBand = this.calculateEntryFeeComfortBand([...boardEntries.map((e) => Number(e.amount)), ...challengeHistory.map((c) => Number(c.entryFee))]);
    const acceptanceRate = this.calculateChallengeAcceptanceRate(challengeHistory);

    try {
      await Promise.all([
        this.prisma.userSkillProfile.upsert({
          where: { userId },
          create: {
            userId,
            skillScore,
            winRate: this.winRate(profile?.wins ?? 0, profile?.losses ?? 0),
            acceptanceRate,
            avgEntryFee: comfortBand.mid,
            volatility: comfortBand.width / 2,
          },
          update: {
            skillScore,
            winRate: this.winRate(profile?.wins ?? 0, profile?.losses ?? 0),
            acceptanceRate,
            avgEntryFee: comfortBand.mid,
            volatility: comfortBand.width / 2,
          },
        }),
        this.prisma.userPreference.upsert({
          where: { userId },
          create: {
            userId,
            preferredCategoryIds: categoryPreference.topCategoryIds,
            minEntryFee: comfortBand.min,
            maxEntryFee: comfortBand.max,
            preferredModes: [],
          },
          update: {
            preferredCategoryIds: categoryPreference.topCategoryIds,
            minEntryFee: comfortBand.min,
            maxEntryFee: comfortBand.max,
          },
        }),
        this.recomputeRivalries(userId, challengeHistory),
        this.recomputeMatchmakingScores(userId, skillScore),
      ]);
    } catch (error) {
      this.logger.warn(`Failed to persist recommendation metrics user=${userId}: ${error instanceof Error ? error.message : 'unknown error'}`);
    }

    return {
      skillScore,
      categoryPreference: categoryPreference.weights,
      preferredCategoryIds: categoryPreference.topCategoryIds.length ? categoryPreference.topCategoryIds : storedPref?.preferredCategoryIds ?? [],
      comfortBand,
      acceptanceRate,
      rivalries,
      storedSkill,
    };
  }

  private calculateSkillScore(wins: number, losses: number, sampleSize: number) {
    const total = Math.max(1, wins + losses);
    const wr = wins / total;
    const confidence = Math.min(1, sampleSize / 20);
    return Number((900 + wr * 500 + confidence * 100).toFixed(2));
  }

  private calculateCategoryPreference(input: {
    behaviorEvents: Array<{ eventType: BehaviorEventType; itemType: string; metadata: unknown }>;
    boardEntries: Array<{ board: { categoryId: string } }>;
    challengeHistory: Array<{ categoryId: string }>;
  }) {
    const weights: Record<string, number> = {};

    for (const entry of input.boardEntries) {
      weights[entry.board.categoryId] = (weights[entry.board.categoryId] ?? 0) + 3;
    }
    for (const challenge of input.challengeHistory) {
      weights[challenge.categoryId] = (weights[challenge.categoryId] ?? 0) + 4;
    }
    for (const [index, event] of input.behaviorEvents.entries()) {
      const categoryId = this.extractCategoryId(event.metadata);
      if (!categoryId) continue;

      const recencyDecay = Math.max(0.65, 1.25 - index * 0.01);
      const eventWeight = this.behaviorEventWeight(event.eventType) * recencyDecay;
      weights[categoryId] = Number(((weights[categoryId] ?? 0) + eventWeight).toFixed(3));
    }

    const sorted = Object.entries(weights).sort((a, b) => b[1] - a[1]);
    return {
      weights,
      topCategoryIds: sorted
        .filter(([, weight]) => weight > 0)
        .slice(0, 3)
        .map(([categoryId]) => categoryId),
    };
  }

  private calculateEntryFeeComfortBand(entryFees: number[]) {
    if (!entryFees.length) return { min: 6, max: 14, mid: 10, width: 8 };

    const avg = entryFees.reduce((sum, fee) => sum + fee, 0) / entryFees.length;
    const variance = entryFees.reduce((sum, fee) => sum + (fee - avg) ** 2, 0) / entryFees.length;
    const stdDev = Math.sqrt(variance);
    const width = Math.max(4, stdDev * 2);

    return {
      min: Number(Math.max(0, avg - width).toFixed(2)),
      max: Number((avg + width).toFixed(2)),
      mid: Number(avg.toFixed(2)),
      width: Number(width.toFixed(2)),
    };
  }

  private calculateChallengeAcceptanceRate(challenges: Array<{ status: ChallengeStatus }>) {
    if (!challenges.length) return 0.5;
    const accepted = challenges.filter((c) => [ChallengeStatus.ACCEPTED, ChallengeStatus.LIVE, ChallengeStatus.COMPLETED].includes(c.status)).length;
    return Number((accepted / challenges.length).toFixed(3));
  }

  private calculateRivalryStrength(matchCount: number, winDelta: number) {
    const density = Math.min(1, matchCount / 6);
    const closeness = 1 - Math.min(1, Math.abs(winDelta) / Math.max(1, matchCount));
    return Number((density * 0.6 + closeness * 0.4).toFixed(3));
  }

  private computeBoardRecommendationScore(input: {
    categoryId: string;
    entryFee: number;
    prizePool: number;
    fillRatio: number;
    userMetrics: {
      skillScore: number;
      categoryPreference: Record<string, number>;
      preferredCategoryIds: string[];
      comfortBand: { min: number; max: number; mid: number; width: number };
      acceptanceRate: number;
    };
  }) {
    const categorySignal = input.userMetrics.categoryPreference[input.categoryId] ?? 0;
    const hasBehaviorSignals = Object.keys(input.userMetrics.categoryPreference).length > 0;
    const categoryPreference = hasBehaviorSignals
      ? input.userMetrics.preferredCategoryIds.includes(input.categoryId)
        ? Math.min(1, Math.max(0.2, categorySignal / 6))
        : categorySignal > 0
          ? Math.min(0.75, categorySignal / 8)
          : 0.15
      : 0.5;
    const entryDistance = Math.abs(input.entryFee - input.userMetrics.comfortBand.mid);
    const entryFit = Math.max(0, 1 - entryDistance / Math.max(4, input.userMetrics.comfortBand.width));
    const prizeValue = Math.min(1, input.prizePool / Math.max(1, input.entryFee * 10));
    const urgency = Math.max(0, 1 - input.fillRatio);
    const engagement = input.userMetrics.acceptanceRate;
    const skillAffinity = Math.min(1, input.userMetrics.skillScore / 1600);

    const weighted = {
      categoryPreference: Number((categoryPreference * 30).toFixed(2)),
      entryFit: Number((entryFit * 22).toFixed(2)),
      prizeValue: Number((prizeValue * 20).toFixed(2)),
      urgency: Number((urgency * 10).toFixed(2)),
      engagement: Number((engagement * 8).toFixed(2)),
      skillAffinity: Number((skillAffinity * 10).toFixed(2)),
    };

    return {
      total: Number((weighted.categoryPreference + weighted.entryFit + weighted.prizeValue + weighted.urgency + weighted.engagement + weighted.skillAffinity).toFixed(2)),
      raw: { categoryPreference, entryFit, prizeValue, urgency, engagement, skillAffinity },
      weighted,
    };
  }

  private computeChallengeRecommendationScore(input: {
    categoryId: string;
    entryFee: number;
    prizePool: number;
    participantCount: number;
    acceptanceRate: number;
    rivalryStrength: number;
    boardScore: number;
  }) {
    const socialProof = Math.min(1, input.participantCount / 2);
    const weighted = {
      boardScore: Number((input.boardScore * 0.62).toFixed(2)),
      rivalryStrength: Number((input.rivalryStrength * 22).toFixed(2)),
      acceptanceRate: Number((input.acceptanceRate * 10).toFixed(2)),
      socialProof: Number((socialProof * 6).toFixed(2)),
    };

    return {
      total: Number((weighted.boardScore + weighted.rivalryStrength + weighted.acceptanceRate + weighted.socialProof).toFixed(2)),
      raw: {
        boardScore: input.boardScore,
        rivalryStrength: input.rivalryStrength,
        acceptanceRate: input.acceptanceRate,
        socialProof,
      },
      weighted,
    };
  }

  private async recomputeRivalries(userId: string, challenges: Array<{ id: string; participants: Array<{ userId: string }>; result: { winnerUserId: string } | null }>) {
    const byOpponent = new Map<string, { matchCount: number; wins: number; losses: number }>();

    for (const challenge of challenges) {
      const opponent = challenge.participants.find((p) => p.userId !== userId)?.userId;
      if (!opponent) continue;

      const current = byOpponent.get(opponent) ?? { matchCount: 0, wins: 0, losses: 0 };
      current.matchCount += 1;
      if (challenge.result?.winnerUserId === userId) current.wins += 1;
      if (challenge.result?.winnerUserId === opponent) current.losses += 1;
      byOpponent.set(opponent, current);
    }

    await Promise.all(
      [...byOpponent.entries()].map(([opponentId, data]) => {
        const ordered = [userId, opponentId].sort();
        const intensity = this.calculateRivalryStrength(data.matchCount, data.wins - data.losses);
        return this.prisma.userRivalry.upsert({
          where: { userAId_userBId: { userAId: ordered[0], userBId: ordered[1] } },
          create: { userAId: ordered[0], userBId: ordered[1], matchCount: data.matchCount, intensity },
          update: { matchCount: data.matchCount, intensity },
        });
      }),
    );
  }

  private async recomputeMatchmakingScores(userId: string, skillScore: number) {
    const otherSkills = await this.prisma.userSkillProfile.findMany({ where: { userId: { not: userId } }, take: 50 });

    await Promise.all(
      otherSkills.map((opponent) => {
        const fairness = Math.max(0, 1 - Math.abs(skillScore - opponent.skillScore) / 800);
        return this.prisma.matchmakingScore.upsert({
          where: { userId_opponentId: { userId, opponentId: opponent.userId } },
          create: {
            userId,
            opponentId: opponent.userId,
            fairness: Number(fairness.toFixed(3)),
            rivalryBoost: 0,
            finalScore: Number((fairness * 100).toFixed(2)),
          },
          update: {
            fairness: Number(fairness.toFixed(3)),
            finalScore: Number((fairness * 100).toFixed(2)),
            computedAt: new Date(),
          },
        });
      }),
    );
  }

  private getRivalryStrengthAgainst(opponentId: string, rivalries: Array<{ userAId: string; userBId: string; intensity: number }>) {
    const rivalry = rivalries.find((r) => r.userAId === opponentId || r.userBId === opponentId);
    return rivalry?.intensity ?? 0;
  }

  private async persistChallengeRecommendations(userId: string, recommendations: Array<{ challengeId: string; score: number; reason: string }>) {
    await Promise.all(
      recommendations.map((rec) =>
        this.prisma.challengeRecommendation.upsert({
          where: { userId_challengeId: { userId, challengeId: rec.challengeId } },
          create: { userId, challengeId: rec.challengeId, score: rec.score, reason: rec.reason },
          update: { score: rec.score, reason: rec.reason },
        }),
      ),
    );
  }

  private buildChallengeReason(score: number, rivalryStrength: number, acceptanceRate: number) {
    if (rivalryStrength > 0.65) return `Strong rivalry signal (${Math.round(rivalryStrength * 100)}%) boosts this matchup.`;
    if (acceptanceRate > 0.6) return `Based on your ${Math.round(acceptanceRate * 100)}% acceptance trend, this challenge is highly likely to convert.`;
    return `Weighted recommendation score ${score.toFixed(1)} from category fit, entry comfort, and prize value.`;
  }

  private winRate(wins: number, losses: number) {
    const total = wins + losses;
    if (!total) return 0;
    return Number((wins / total).toFixed(3));
  }

  private extractCategoryId(metadata: unknown) {
    if (!metadata || typeof metadata !== 'object') return null;
    const categoryId = (metadata as Record<string, unknown>).categoryId;
    return typeof categoryId === 'string' ? categoryId : null;
  }

  private behaviorEventWeight(eventType: BehaviorEventType) {
    switch (eventType) {
      case BehaviorEventType.JOIN:
      case BehaviorEventType.ACCEPT:
        return 3;
      case BehaviorEventType.SAVE:
      case BehaviorEventType.SWIPE_RIGHT:
        return 2;
      case BehaviorEventType.VIEW:
      case BehaviorEventType.SEARCH:
        return 0.75;
      case BehaviorEventType.SWIPE_LEFT:
      case BehaviorEventType.SWIPE_UP:
        return -2;
      default:
        return 0;
    }
  }
}
