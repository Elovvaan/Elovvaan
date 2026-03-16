import { PrismaClient, BoardStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const categories = await Promise.all(
    ['FPS', 'Sports', 'Strategy'].map((name) =>
      prisma.category.upsert({
        where: { slug: name.toLowerCase() },
        create: { name, slug: name.toLowerCase() },
        update: {},
      }),
    ),
  );

  const passwordHash = await bcrypt.hash('Passw0rd!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@swipe2win.app' },
    update: {},
    create: {
      email: 'demo@swipe2win.app',
      passwordHash,
      profile: {
        create: {
          username: 'demoPlayer',
          onboardingDone: true,
          bio: 'Demo account for local development',
        },
      },
      wallet: { create: { balance: 250, creditBalance: 50 } },
    },
  });

  await prisma.board.createMany({
    data: [
      {
        title: 'Night Clash Prize Board',
        description: 'Fast-fill board for FPS fans',
        categoryId: categories[0].id,
        entryFee: 10,
        prizePool: 180,
        spotCount: 18,
        filledSpots: 6,
        status: BoardStatus.OPEN,
        creatorId: user.id,
      },
      {
        title: 'Weekend Sports Ladder',
        description: 'Competitive sports challenge board',
        categoryId: categories[1].id,
        entryFee: 15,
        prizePool: 300,
        spotCount: 20,
        filledSpots: 9,
        status: BoardStatus.OPEN,
        creatorId: user.id,
      },
      {
        title: 'Strategy Sprint',
        description: 'Mid-stakes board with quick fill potential',
        categoryId: categories[2].id,
        entryFee: 8,
        prizePool: 120,
        spotCount: 15,
        filledSpots: 4,
        status: BoardStatus.OPEN,
        creatorId: user.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seed complete: demo user, wallet, categories, and boards');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
