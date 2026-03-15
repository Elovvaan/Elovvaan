import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('daily_metrics')
@Index('idx_daily_metrics_day', ['day'], { unique: true })
export class DailyMetric {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'date' })
  day!: string;

  @Column({ name: 'entries_count', type: 'int', default: 0 })
  entriesCount!: number;

  @Column({ name: 'payments_success_count', type: 'int', default: 0 })
  paymentsSuccessCount!: number;

  @Column({ name: 'boards_full_count', type: 'int', default: 0 })
  boardsFullCount!: number;

  @Column({ name: 'winners_selected_count', type: 'int', default: 0 })
  winnersSelectedCount!: number;

  @Column({ name: 'gross_revenue', type: 'decimal', precision: 12, scale: 2, default: 0 })
  grossRevenue!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
