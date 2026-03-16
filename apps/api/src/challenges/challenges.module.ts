import { Module } from '@nestjs/common';
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';
import { WalletModule } from '../wallet/wallet.module';

@Module({ imports: [WalletModule], controllers: [ChallengesController], providers: [ChallengesService], exports: [ChallengesService] })
export class ChallengesModule {}
