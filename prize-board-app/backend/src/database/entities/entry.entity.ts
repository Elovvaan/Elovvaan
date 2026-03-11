import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  Unique
} from 'typeorm';
import { Board } from './board.entity';
import { User } from './user.entity';
import { Payment } from './payment.entity';

@Entity('entries')
@Index(['boardId'])
@Index(['userId'])
@Unique('uq_entries_external_ref', ['externalReference'])
export class Entry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.entries, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @RelationId((entry: Entry) => entry.user)
  userId!: string;

  @ManyToOne(() => Board, (board) => board.entries, { nullable: false })
  @JoinColumn({ name: 'board_id' })
  board!: Board;

  @RelationId((entry: Entry) => entry.board)
  boardId!: string;

  @ManyToOne(() => Payment, (payment) => payment.entries, { nullable: false, eager: true })
  @JoinColumn({ name: 'payment_id' })
  payment!: Payment;

  @RelationId((entry: Entry) => entry.payment)
  paymentId!: string;

  @Column({ name: 'external_reference', nullable: true })
  externalReference?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
