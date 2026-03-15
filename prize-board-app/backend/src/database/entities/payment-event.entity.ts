import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('payment_events')
export class PaymentEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'provider_event_id' })
  providerEventId!: string;

  @Column({ name: 'payment_intent_id' })
  paymentIntentId!: string;

  @Column({ name: 'event_type' })
  eventType!: string;

  @Column({ name: 'is_processed', default: false })
  isProcessed!: boolean;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
