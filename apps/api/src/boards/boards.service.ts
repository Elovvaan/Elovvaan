import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BoardStatus, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { CreateBoardDto } from './dto/create-board.dto';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService, private walletService: WalletService) {}

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
    if (board.filledSpots >= board.spotCount) throw new BadRequestException('No spots remaining');

    await this.walletService.adjust(userId, -Number(board.entryFee), TransactionType.ENTRY_FEE, `Board entry ${board.id}`);
    return this.prisma.$transaction(async (tx) => {
      const entry = await tx.boardEntry.create({
        data: {
          boardId: id,
          userId,
          amount: board.entryFee,
          slotNo: board.filledSpots + 1,
        },
      });

      await tx.board.update({
        where: { id },
        data: {
          filledSpots: { increment: 1 },
          status: board.filledSpots + 1 >= board.spotCount ? BoardStatus.FULL : BoardStatus.OPEN,
        },
      });
      return entry;
    });
  }
}
