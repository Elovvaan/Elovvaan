import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async createBoard(dto: CreateBoardDto) {
    const board = await this.prisma.board.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        description: dto.description,
        status: dto.status,
        pricePerEntry: dto.pricePerEntry,
        totalCells: dto.totalCells,
      },
    });

    await this.prisma.boardCell.createMany({
      data: Array.from({ length: dto.totalCells }, (_, i) => ({ boardId: board.id, cellNumber: i + 1 })),
    });

    return board;
  }

  listBoards() {
    return this.prisma.board.findMany({ orderBy: { createdAt: 'desc' } });
  }

  updateBoard(id: string, dto: UpdateBoardDto) {
    return this.prisma.board.update({ where: { id }, data: dto });
  }

  listUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, role: true, credits: true, createdAt: true },
    });
  }

  listEntriesByBoard(boardId: string) {
    return this.prisma.entry.findMany({
      where: { boardId },
      include: {
        user: { select: { id: true, email: true } },
        boardCell: { select: { cellNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
