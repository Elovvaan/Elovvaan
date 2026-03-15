import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletAccount } from '../../database/entities/wallet-account.entity';
import { WalletTransaction } from '../../database/entities/wallet-transaction.entity';
import { WalletService } from './wallet.service';

@Module({
  imports: [TypeOrmModule.forFeature([WalletAccount, WalletTransaction])],
  providers: [WalletService],
  exports: [WalletService]
})
export class WalletModule {}
