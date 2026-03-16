import { PrismaClient, BoardStatus, BehaviorEventType, ChallengeStatus, ChallengeType } from '@prisma/client';
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
  const demoUser = await prisma.user.upsert({
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
    include: { profile: true },
  });

  const rivalUser = await prisma.user.upsert({
    where: { email: 'rival@swipe2win.app' },
    update: {},
    create: {
      email: 'rival@swipe2win.app',
      passwordHash,
      profile: {
        create: {
          username: 'rivalPlayer',
          onboardingDone: true,
          bio: 'Secondary seeded player for challenge recommendations',
        },
      },
      wallet: { create: { balance: 150, creditBalance: 25 } },
    },
    include: { profile: true },
  });

  await prisma.userBehaviorEvent.deleteMany({ where: { userId: demoUser.id } });
  await prisma.challengeParticipant.deleteMany({ where: { userId: demoUser.id } });
  await prisma.challenge.deleteMany({ where: { creatorId: demoUser.id } });
  await prisma.board.deleteMany({ where: { creatorId: demoUser.id } });

  const boards = await Promise.all([
    prisma.board.create({
      data: {
        title: 'Night Clash Prize Board',
        description: 'Fast-fill board for FPS fans',
        categoryId: categories[0].id,
        entryFee: 10,
        prizePool: 180,
        spotCount: 18,
        filledSpots: 6,
        status: BoardStatus.OPEN,
        creatorId: demoUser.id,
      },
    }),
    prisma.board.create({
      data: {
        title: 'Weekend Sports Ladder',
        description: 'Competitive sports challenge board',
        categoryId: categories[1].id,
        entryFee: 15,
        prizePool: 300,
        spotCount: 20,
        filledSpots: 9,
        status: BoardStatus.OPEN,
        creatorId: demoUser.id,
      },
    }),
    prisma.board.create({
      data: {
        title: 'Strategy Sprint',
        description: 'Mid-stakes board with quick fill potential',
        categoryId: categories[2].id,
        entryFee: 8,
        prizePool: 120,
        spotCount: 15,
        filledSpots: 4,
        status: BoardStatus.OPEN,
        creatorId: demoUser.id,
      },
    }),
  ]);

  const challenges = await Promise.all([
    prisma.challenge.create({
      data: {
        title: 'FPS Duel: Demo vs Rival',
        description: 'High-confidence 1v1 with rivalry history.',
        categoryId: categories[0].id,
        type: ChallengeType.PUBLIC,
        status: ChallengeStatus.OPEN,
        entryFee: 12,
        prizePool: 220,
        creatorId: rivalUser.id,
      },
    }),
    prisma.challenge.create({
      data: {
        title: 'Strategy Mindgame Open',
        description: 'Low-stakes open challenge for ranked feed tests.',
        categoryId: categories[2].id,
        type: ChallengeType.PUBLIC,
        status: ChallengeStatus.OPEN,
        entryFee: 6,
        prizePool: 90,
        creatorId: rivalUser.id,
      },
    }),
  ]);

  await prisma.challengeParticipant.createMany({
    data: [
      { challengeId: challenges[0].id, userId: rivalUser.id },
      { challengeId: challenges[1].id, userId: rivalUser.id },
    ],
    skipDuplicates: true,
  });

  await prisma.userBehaviorEvent.createMany({
    data: [
      { userId: demoUser.id, eventType: BehaviorEventType.VIEW, itemType: 'BOARD', itemId: boards[0].id, metadata: { categoryId: categories[0].id } },
      { userId: demoUser.id, eventType: BehaviorEventType.JOIN, itemType: 'BOARD', itemId: boards[0].id, metadata: { categoryId: categories[0].id } },
      { userId: demoUser.id, eventType: BehaviorEventType.SAVE, itemType: 'CHALLENGE', itemId: challenges[0].id, metadata: { categoryId: categories[0].id } },
      { userId: demoUser.id, eventType: BehaviorEventType.SWIPE_LEFT, itemType: 'BOARD', itemId: boards[2].id, metadata: { categoryId: categories[2].id } },
    ],
  });

  console.log('Seed complete: demo+rival users, boards, challenges, and recommendation behavior events.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
