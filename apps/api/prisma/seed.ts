import { PrismaClient, Role, BoardStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createBoardWithCells(title: string, slug: string, status: BoardStatus, totalCells: number, pricePerEntry: number) {
  const board = await prisma.board.create({
    data: { title, slug, status, totalCells, pricePerEntry, filledCells: 0 },
  });

  await prisma.boardCell.createMany({
    data: Array.from({ length: totalCells }, (_, i) => ({
      boardId: board.id,
      cellNumber: i + 1,
    })),
  });

  return board;
}

async function main() {
  const passwordHash = await bcrypt.hash('ChangeMe123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@swipe2win.com' },
    update: {},
    create: { email: 'admin@swipe2win.com', passwordHash, role: Role.ADMIN },
  });

  const users = ['alex@swipe2win.com', 'sam@swipe2win.com', 'jordan@swipe2win.com'];
  for (const email of users) {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, passwordHash, role: Role.USER },
    });
  }

  const existing = await prisma.board.count();
  if (existing === 0) {
    await createBoardWithCells('March Mega Board', 'march-mega-board', BoardStatus.ACTIVE, 25, 5);
    await createBoardWithCells('Spring Lucky Board', 'spring-lucky-board', BoardStatus.DRAFT, 16, 2.5);
    await createBoardWithCells('Weekend Winner Board', 'weekend-winner-board', BoardStatus.ACTIVE, 36, 3);
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
