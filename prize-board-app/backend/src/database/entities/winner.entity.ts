import { CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { Board } from './board.entity';
import { User } from './user.entity';
import { Entry } from './entry.entity';

@Entity('winners')
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
