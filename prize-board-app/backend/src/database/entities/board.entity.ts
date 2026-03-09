import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Entry } from './entry.entity';
import { Winner } from './winner.entity';

export enum BoardStatus {
  UPCOMING = 'upcoming',
  LIVE = 'live',
  FULL = 'full',
  COMPLETED = 'completed'
}

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ name: 'prize_name' })
  prizeName!: string;

  @Column({ name: 'prize_image_url' })
  prizeImageUrl!: string;

  @Column({ name: 'entry_price', type: 'decimal', precision: 10, scale: 2 })
  entryPrice!: number;

  @Column({ name: 'total_spots', type: 'int' })
  totalSpots!: number;

  @Column({ name: 'spots_filled', type: 'int', default: 0 })
  spotsFilled!: number;

  @Column({ type: 'enum', enum: BoardStatus, default: BoardStatus.UPCOMING })
  status!: BoardStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => Entry, (entry) => entry.board)
  entries!: Entry[];

  @OneToMany(() => Winner, (winner) => winner.board)
  winners!: Winner[];
}
