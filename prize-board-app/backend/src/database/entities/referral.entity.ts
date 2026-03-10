import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('referrals')
@Index(['referrerUserId', 'referredUserId'], { unique: true })
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'referrer_user_id' })
  referrerUserId!: string;

  @Index()
  @Column({ name: 'referred_user_id' })
  referredUserId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
