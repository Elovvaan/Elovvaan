import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('fraud_notes')
export class FraudNote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'admin_user_id' })
  adminUserId!: string;

  @Column({ type: 'text' })
  note!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
