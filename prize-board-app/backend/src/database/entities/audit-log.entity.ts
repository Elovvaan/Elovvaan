import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'actor_user_id', nullable: true })
  actorUserId?: string;

  @Column({ name: 'action', type: 'varchar', length: 120 })
  action!: string;

  @Column({ name: 'target_type', type: 'varchar', length: 80, nullable: true })
  targetType?: string;

  @Column({ name: 'target_id', nullable: true })
  targetId?: string;

  @Column({ name: 'metadata', type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
