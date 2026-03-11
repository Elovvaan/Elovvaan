import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { Board } from './board.entity';

@Entity('board_activities')
@Index(['boardId', 'createdAt'])
export class BoardActivity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Board, { nullable: false })
  @JoinColumn({ name: 'board_id' })
  board!: Board;

  @RelationId((activity: BoardActivity) => activity.board)
  boardId!: string;

  @Column({ name: 'event_type' })
  eventType!: string;

  @Column({ type: 'jsonb', default: {} })
  payload!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
