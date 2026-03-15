import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { WalletAccount } from '../../database/entities/wallet-account.entity';
import { WalletTransaction, WalletTransactionType } from '../../database/entities/wallet-transaction.entity';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class WalletService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(WalletAccount) private walletAccountsRepo: Repository<WalletAccount>,
    @InjectRepository(WalletTransaction) private walletTransactionsRepo: Repository<WalletTransaction>
  ) {}

  async ensureAccount(userId: string, manager = this.dataSource.manager) {
    const walletRepo = manager.getRepository(WalletAccount);
    let account = await walletRepo.findOne({ where: { user: { id: userId } }, lock: { mode: 'pessimistic_write' } });
    if (!account) {
      account = await walletRepo.save(walletRepo.create({ user: { id: userId } as User, balanceCents: 0 }));
    }
    return account;
  }

  async credit(userId: string, amountCents: number, reason: string, referenceId: string, metadata: Record<string, unknown> = {}, transactionManager?: EntityManager) {
    if (amountCents <= 0) throw new BadRequestException('Credit amount must be greater than zero');
    return this.applyTransaction(userId, WalletTransactionType.CREDIT, amountCents, reason, referenceId, metadata, transactionManager);
  }

  async debit(userId: string, amountCents: number, reason: string, referenceId: string, metadata: Record<string, unknown> = {}, transactionManager?: EntityManager) {
    if (amountCents <= 0) throw new BadRequestException('Debit amount must be greater than zero');
    return this.applyTransaction(userId, WalletTransactionType.DEBIT, amountCents, reason, referenceId, metadata, transactionManager);
  }

  async getBalance(userId: string) {
    const account = await this.walletAccountsRepo.findOne({ where: { user: { id: userId } } });
    return account?.balanceCents || 0;
  }

  private async applyTransaction(
    userId: string,
    type: WalletTransactionType,
    amountCents: number,
    reason: string,
    referenceId: string,
    metadata: Record<string, unknown>,
    transactionManager?: EntityManager
  ) {
    const executeTransaction = async (manager: EntityManager) => {
      const txRepo = manager.getRepository(WalletTransaction);
      const existing = await txRepo.findOne({ where: { referenceId } });
      if (existing) {
        return existing;
      }

      const account = await this.ensureAccount(userId, manager);
      const delta = type === WalletTransactionType.CREDIT ? amountCents : -amountCents;
      const balanceAfter = account.balanceCents + delta;

      if (balanceAfter < 0) {
        throw new BadRequestException('Insufficient wallet balance');
      }

      account.balanceCents = balanceAfter;
      await manager.getRepository(WalletAccount).save(account);

      const transaction = txRepo.create({
        walletAccount: account,
        type,
        amountCents,
        balanceAfterCents: balanceAfter,
        reason,
        referenceId,
        metadata
      });

      return txRepo.save(transaction);
    };

    // If a transaction manager is provided, use it directly (join existing transaction)
    // Otherwise, create a new transaction
    if (transactionManager) {
      return executeTransaction(transactionManager);
    }
    return this.dataSource.transaction(executeTransaction);
  }
}
