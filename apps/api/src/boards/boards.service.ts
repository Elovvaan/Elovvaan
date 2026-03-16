import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BoardStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ClaimCellDto } from './dto/claim-cell.dto';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  listBoards() {
    return this.prisma.board.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        pricePerEntry: true,
        totalCells: true,
        filledCells: true,
      },
    });
  }

  async getBoard(id: string) {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: {
        cells: {
          orderBy: { cellNumber: 'asc' },
          select: { id: true, cellNumber: true, isClaimed: true, userId: true },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return board;
  }

  async claimCell(boardId: string, userId: string, dto: ClaimCellDto) {
    return this.prisma.$transaction(async (tx) => {
      const board = await tx.board.findUnique({ where: { id: boardId } });
      if (!board) throw new NotFoundException('Board not found');
      if (board.status !== BoardStatus.ACTIVE) {
        throw new BadRequestException('Board is not active');
      }

      const cell = await tx.boardCell.findUnique({ where: { boardId_cellNumber: { boardId, cellNumber: dto.cellNumber } } });
      if (!cell) throw new NotFoundException('Cell not found');
      if (cell.isClaimed) throw new BadRequestException('Cell is already claimed');

      await tx.boardCell.update({
        where: { id: cell.id },
        data: { isClaimed: true, userId, claimedAt: new Date() },
      });

      const entry = await tx.entry.create({
        data: {
          userId,
          boardId,
          boardCellId: cell.id,
          amountPaid: new Prisma.Decimal(board.pricePerEntry),
        },
      });

      await tx.board.update({ where: { id: boardId }, data: { filledCells: { increment: 1 } } });

      return entry;
    });
  }
}
