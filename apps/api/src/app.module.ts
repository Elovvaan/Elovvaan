import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config.validation';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletModule } from './wallet/wallet.module';
import { BoardsModule } from './boards/boards.module';
import { ChallengesModule } from './challenges/challenges.module';
import { ArenaModule } from './arena/arena.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { ProfilesModule } from './profiles/profiles.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    WalletModule,
    BoardsModule,
    ChallengesModule,
    ArenaModule,
    RecommendationsModule,
    ProfilesModule,
    LeaderboardModule,
  ],
})
export class AppModule {}
