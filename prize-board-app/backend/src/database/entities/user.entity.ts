import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Entry } from './entry.entity';
import { Payment } from './payment.entity';
import { Winner } from './winner.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Index({ unique: true })
  @Column({ name: 'referral_code', unique: true })
  referralCode!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'is_admin', default: false })
  isAdmin!: boolean;

  @Column({ type: 'int', default: 0 })
  xp!: number;

  @Column({ name: 'prestige_level', type: 'int', default: 0 })
  prestigeLevel!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => Entry, (entry) => entry.user)
  entries!: Entry[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments!: Payment[];

  @OneToMany(() => Winner, (winner) => winner.user)
  wins!: Winner[];
}
