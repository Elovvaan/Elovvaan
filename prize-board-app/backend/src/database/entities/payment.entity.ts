import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId
} from 'typeorm';
import { User } from './user.entity';
import { Board } from './board.entity';
import { Entry } from './entry.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED'
}

@Entity('payments')
@Index(['boardId'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.payments, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @RelationId((payment: Payment) => payment.user)
  userId!: string;

  @ManyToOne(() => Board, (board) => board.payments, { nullable: false })
  @JoinColumn({ name: 'board_id' })
  board!: Board;

  @RelationId((payment: Payment) => payment.board)
  boardId!: string;

  @Column({ name: 'stripe_payment_intent_id', unique: true })
  stripePaymentIntentId!: string;

  @Column({ name: 'webhook_event_id', nullable: true, unique: true })
  webhookEventId?: string;

  @Column({ name: 'entry_quantity', type: 'int', default: 1 })
  entryQuantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => Entry, (entry) => entry.payment)
  entries!: Entry[];
}
