import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { Board } from './board.entity';
import { User } from './user.entity';
import { Entry } from './entry.entity';

export enum WinnerClaimStatus {
  PENDING = 'PENDING',
  CLAIMED = 'CLAIMED',
  EXPIRED = 'EXPIRED'
}

@Entity('winners')
@Index(['board'], { unique: true })
export class Winner {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Board, (board) => board.winners, { nullable: false })
  @JoinColumn({ name: 'board_id' })
  board!: Board;

  @RelationId((winner: Winner) => winner.board)
  boardId!: string;

  @OneToOne(() => Entry, { nullable: false, eager: true })
  @JoinColumn({ name: 'entry_id' })
  entry!: Entry;

  @RelationId((winner: Winner) => winner.entry)
  entryId!: string;

  @ManyToOne(() => User, (user) => user.wins, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @RelationId((winner: Winner) => winner.user)
  userId!: string;

  @Column({ name: 'selection_seed', type: 'varchar', length: 64, nullable: true })
  selectionSeed?: string;

  @Column({ name: 'selection_candidate_count', type: 'int', default: 0 })
  selectionCandidateCount!: number;

  @Column({ name: 'selection_index', type: 'int', default: 0 })
  selectionIndex!: number;

  @Column({ name: 'claim_status', type: 'enum', enum: WinnerClaimStatus, default: WinnerClaimStatus.PENDING })
  claimStatus!: WinnerClaimStatus;

  @Column({ name: 'claimed_at', type: 'timestamp', nullable: true })
  claimedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
