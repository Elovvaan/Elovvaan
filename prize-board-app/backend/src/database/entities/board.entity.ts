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

export enum PrizeVerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
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

  @Column({ name: 'prize_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  prizeValue?: number;

  @Column({ name: 'prize_image_url', nullable: true })
  prizeImageUrl?: string;

  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: PrizeVerificationStatus,
    default: PrizeVerificationStatus.PENDING
  })
  verificationStatus!: PrizeVerificationStatus;

  @Column({ name: 'board_revenue', type: 'decimal', precision: 10, scale: 2, default: 0 })
  boardRevenue!: number;

  @Column({ name: 'creator_share', type: 'decimal', precision: 10, scale: 2, default: 0 })
  creatorShare!: number;

  @Column({ name: 'platform_share', type: 'decimal', precision: 10, scale: 2, default: 0 })
  platformShare!: number;

  @Column({ name: 'escrow_released', default: false })
  escrowReleased!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => Entry, (entry) => entry.board)
  entries!: Entry[];

  @OneToMany(() => Payment, (payment) => payment.board)
  payments!: Payment[];

  @OneToMany(() => Winner, (winner) => winner.board)
  winners!: Winner[];
}
