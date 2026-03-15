import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Winner } from '../../database/entities/winner.entity';
import { WinnersService } from './winners.service';
import { WinnersController } from './winners.controller';
import { Entry } from '../../database/entities/entry.entity';
import { Board } from '../../database/entities/board.entity';
import { AuditModule } from '../../common/audit/audit.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [TypeOrmModule.forFeature([Winner, Entry, Board]), AuditModule, WalletModule],
  providers: [WinnersService],
  controllers: [WinnersController],
  exports: [WinnersService]
})
export class WinnersModule {}
