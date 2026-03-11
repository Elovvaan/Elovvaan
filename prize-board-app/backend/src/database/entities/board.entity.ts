import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { Entry } from './entry.entity';
import { Payment } from './payment.entity';
import { Winner } from './winner.entity';
import { User } from './user.entity';

export enum BoardStatus {
  OPEN = 'OPEN',
  FULL = 'FULL',
  CLOSED = 'CLOSED'
}

@Entity('boards')
@Index(['status'])
@Index(['createdAt'])
export class Board {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'price_per_entry', type: 'decimal', precision: 10, scale: 2 })
  pricePerEntry!: number;

  @Column({ name: 'max_entries', type: 'int' })
  maxEntries!: number;

  @Column({ name: 'current_entries', type: 'int', default: 0 })
  currentEntries!: number;

  @Column({ type: 'enum', enum: BoardStatus, default: BoardStatus.OPEN })
  status!: BoardStatus;


  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'creator_user_id' })
  creatorUser?: User;

  @RelationId((board: Board) => board.creatorUser)
  creatorUserId?: string;

  @Column({ name: 'prize_description', type: 'text', nullable: true })
  prizeDescription?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => Entry, (entry) => entry.board)
  entries!: Entry[];

  @OneToMany(() => Payment, (payment) => payment.board)
  payments!: Payment[];

  @OneToMany(() => Winner, (winner) => winner.board)
  winners!: Winner[];
}
