import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Board } from './board.entity';

@Entity('board_activities')
@Index(['boardId', 'createdAt'])
export class BoardActivity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'board_id', type: 'uuid' })
  boardId!: string;

  @ManyToOne(() => Board, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'board_id' })
  board!: Board;

  @Column({ name: 'event_type' })
  eventType!: string;

  @Column({ type: 'jsonb', default: {} })
  payload!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
