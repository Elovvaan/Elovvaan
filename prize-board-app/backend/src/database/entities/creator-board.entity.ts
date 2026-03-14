import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Board } from './board.entity';

@Entity('creator_boards')
@Index(['creatorUserId'])
export class CreatorBoard {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'creator_user_id', type: 'uuid' })
  creatorUserId!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'creator_user_id' })
  creatorUser!: User;

  @OneToOne(() => Board, { nullable: false, eager: true })
  @JoinColumn({ name: 'board_id' })
  board!: Board;

  @Column({ name: 'entry_price', type: 'decimal', precision: 10, scale: 2 })
  entryPrice!: number;

  @Column({ name: 'max_entries', type: 'int' })
  maxEntries!: number;

  @Column({ name: 'platform_fee_percent', type: 'decimal', precision: 5, scale: 2, default: 20 })
  platformFeePercent!: number;

  @Column({ name: 'prize_description', type: 'text' })
  prizeDescription!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
