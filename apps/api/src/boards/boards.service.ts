import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BoardStatus, Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateBoardDto) {
    return this.prisma.board.create({
      data: { ...dto, status: BoardStatus.OPEN, creatorId: userId },
      include: { category: true },
    });
  }

  list() {
    return this.prisma.board.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } });
  }

  async details(id: string) {
    const board = await this.prisma.board.findUnique({ include: { category: true, entries: true, prizes: true }, where: { id } });
    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  async join(userId: string, id: string) {
    const board = await this.details(id);
    if (board.status !== BoardStatus.OPEN) throw new BadRequestException('Board is not open');

    const alreadyJoined = await this.prisma.boardEntry.findFirst({ where: { boardId: id, userId } });
    if (alreadyJoined) throw new BadRequestException('You have already joined this board');

    return this.prisma
      .$transaction(async (tx) => {
        const current = await tx.board.findUnique({ where: { id } });
        if (!current) throw new NotFoundException('Board not found');
        if (current.status !== BoardStatus.OPEN || current.filledSpots >= current.spotCount) {
          throw new BadRequestException('No spots remaining');
        }

        const wallet = await tx.wallet.findUnique({ where: { userId } });
        if (!wallet) throw new NotFoundException('Wallet not found');

        const entryFee = Number(current.entryFee);
        if (Number(wallet.balance) < entryFee) {
          throw new BadRequestException('Insufficient wallet balance');
        }

        const slotNo = current.filledSpots + 1;
        const entry = await tx.boardEntry.create({
          data: {
            boardId: id,
            userId,
            amount: current.entryFee,
            slotNo,
          },
        });

        await tx.board.update({
          where: { id },
          data: {
            filledSpots: { increment: 1 },
            status: slotNo >= current.spotCount ? BoardStatus.FULL : BoardStatus.OPEN,
          },
        });

        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { decrement: entryFee } },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            userId,
            amount: -entryFee,
            type: TransactionType.ENTRY_FEE,
            note: `Board entry ${id}`,
          },
        });

        return entry;
      })
      .catch((error: unknown) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new BadRequestException('Board spot was just taken. Try again.');
        }
        throw error;
      });
  }
}
