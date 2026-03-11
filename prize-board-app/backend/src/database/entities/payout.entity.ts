import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum PayoutStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID'
}

@Entity('payouts')
@Index(['creatorUserId', 'status'])
export class Payout {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'creator_user_id' })
  creatorUserId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'enum', enum: PayoutStatus, default: PayoutStatus.PENDING })
  status!: PayoutStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
