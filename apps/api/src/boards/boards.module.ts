import { Module } from '@nestjs/common';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { WalletModule } from '../wallet/wallet.module';

@Module({ imports: [WalletModule], controllers: [BoardsController], providers: [BoardsService], exports: [BoardsService] })
export class BoardsModule {}
