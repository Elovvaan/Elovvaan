import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Board } from './board.entity';
import { User } from './user.entity';
import { Payment } from './payment.entity';

@Entity('entries')
export class Entry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Board, (board) => board.entries)
  board!: Board;

  @ManyToOne(() => User, (user) => user.entries)
  user!: User;

  @ManyToOne(() => Payment)
  payment!: Payment;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
