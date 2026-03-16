import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  me(userId: string) {
    return this.prisma.profile.findUnique({
      where: { userId },
      include: {
        favoriteCategory: true,
        user: {
          include: {
            savedItems: true,
            challengeParts: { include: { challenge: { include: { result: true } } }, take: 20, orderBy: { id: 'desc' } },
          },
        },
      },
    });
  }
}
