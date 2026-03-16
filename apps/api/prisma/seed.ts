import { PrismaClient, BoardStatus, ChallengeStatus, ChallengeType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const categories = await Promise.all(
    ['FPS', 'Sports', 'Strategy', 'Arcade', 'Trivia'].map((name) =>
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
      profile: { create: { username: 'demoPlayer', onboardingDone: true } },
      wallet: { create: { balance: 250, creditBalance: 50 } },
      skillProfile: { create: { skillScore: 1060, winRate: 0.62, acceptanceRate: 0.74, avgEntryFee: 12 } },
      preferences: {
        create: {
          preferredCategoryIds: [categories[0].id, categories[1].id],
          minEntryFee: 5,
          maxEntryFee: 25,
          preferredModes: ['public', 'direct'],
        },
      },
    },
    include: { wallet: true },
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
    ],
    skipDuplicates: true,
  });

  await prisma.challenge.createMany({
    data: [
      {
        title: '1v1 Aim Duel',
        description: 'Public challenge in FPS',
        categoryId: categories[0].id,
        type: ChallengeType.PUBLIC,
        status: ChallengeStatus.OPEN,
        entryFee: 12,
        prizePool: 24,
        creatorId: user.id,
      },
      {
        title: 'Trivia Callout',
        description: 'Direct challenge from creator',
        categoryId: categories[4].id,
        type: ChallengeType.DIRECT,
        status: ChallengeStatus.OPEN,
        entryFee: 8,
        prizePool: 16,
        creatorId: user.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
