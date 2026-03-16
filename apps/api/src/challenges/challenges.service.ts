import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ChallengeStatus, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { RecordResultDto } from './dto/record-result.dto';

@Injectable()
export class ChallengesService {
  constructor(private prisma: PrismaService, private wallet: WalletService) {}

  async create(userId: string, dto: CreateChallengeDto) {
    return this.prisma.challenge.create({
      data: {
        title: dto.title,
        description: dto.description,
        categoryId: dto.categoryId,
        type: dto.type,
        calledOutUserId: dto.calledOutUserId,
        entryFee: dto.entryFee,
        prizePool: dto.entryFee * 2,
        creatorId: userId,
        participants: { create: { userId, acceptedAt: new Date() } },
      },
    });
  }

  list() {
    return this.prisma.challenge.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } });
  }

  async details(id: string) {
    const challenge = await this.prisma.challenge.findUnique({ where: { id }, include: { participants: true, result: true } });
    if (!challenge) throw new NotFoundException('Challenge not found');
    return challenge;
  }

  async accept(userId: string, id: string) {
    const challenge = await this.details(id);
    if (challenge.status !== ChallengeStatus.OPEN) throw new BadRequestException('Challenge not open');
    if (challenge.participants.some((p) => p.userId === userId)) throw new BadRequestException('Already joined');

    await this.wallet.adjust(userId, -Number(challenge.entryFee), TransactionType.ENTRY_FEE, `Challenge entry ${challenge.id}`);

    return this.prisma.$transaction(async (tx) => {
      await tx.challengeParticipant.create({ data: { challengeId: id, userId, acceptedAt: new Date() } });
      return tx.challenge.update({
        where: { id },
        data: { status: ChallengeStatus.ACCEPTED, prizePool: { increment: challenge.entryFee } },
      });
    });
  }

  async recordResult(id: string, dto: RecordResultDto) {
    const challenge = await this.details(id);
    if ([ChallengeStatus.CANCELLED, ChallengeStatus.DECLINED].includes(challenge.status)) {
      throw new BadRequestException('Challenge closed');
    }

    await this.wallet.adjust(dto.winnerUserId, Number(challenge.prizePool), TransactionType.PRIZE_PAYOUT, `Challenge payout ${id}`);

    return this.prisma.$transaction(async (tx) => {
      await tx.challengeResult.upsert({
        where: { challengeId: id },
        update: { winnerUserId: dto.winnerUserId, score: dto.score },
        create: { challengeId: id, winnerUserId: dto.winnerUserId, score: dto.score },
      });
      return tx.challenge.update({ where: { id }, data: { status: ChallengeStatus.COMPLETED, completedAt: new Date() } });
    });
  }

  history(userId: string) {
    return this.prisma.challenge.findMany({
      where: { participants: { some: { userId } } },
      include: { result: true, category: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
