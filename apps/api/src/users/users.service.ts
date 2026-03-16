import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  getMyEntries(userId: string) {
    return this.prisma.entry.findMany({
      where: { userId },
      include: {
        board: { select: { id: true, title: true, slug: true, status: true } },
        boardCell: { select: { id: true, cellNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
