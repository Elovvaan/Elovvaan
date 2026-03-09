import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Board } from './board.entity';
import { User } from './user.entity';

@Entity('winners')
export class Winner {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Board, (board) => board.winners)
  board!: Board;

  @ManyToOne(() => User, (user) => user.wins)
  user!: User;

  @Column({ name: 'rng_result' })
  rngResult!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
