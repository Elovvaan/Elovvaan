import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId, Unique } from 'typeorm';
import { WalletAccount } from './wallet-account.entity';

export enum WalletTransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
}

@Entity('wallet_transactions')
@Index(['walletAccount'])
@Unique('uq_wallet_transactions_reference', ['referenceId'])
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => WalletAccount, { nullable: false })
  @JoinColumn({ name: 'wallet_account_id' })
  walletAccount!: WalletAccount;

  @RelationId((txn: WalletTransaction) => txn.walletAccount)
  walletAccountId!: string;

  @Column({ type: 'enum', enum: WalletTransactionType })
  type!: WalletTransactionType;

  @Column({ name: 'amount_cents', type: 'int' })
  amountCents!: number;

  @Column({ name: 'balance_after_cents', type: 'int' })
  balanceAfterCents!: number;

  @Column({ name: 'reason', type: 'varchar', length: 120 })
  reason!: string;

  @Column({ name: 'reference_id', type: 'varchar', length: 160 })
  referenceId!: string;

  @Column({ name: 'metadata', type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
