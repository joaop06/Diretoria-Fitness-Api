import {
  Column,
  Entity,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude, Transform } from 'class-transformer';
import { RankingEntity } from '../../ranking/entities/ranking.entity';
import { ParticipantsEntity } from '../../participants/entities/participants.entity';

@Entity('users')
export class UsersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Exclude()
  @Column({ nullable: false })
  password: string;

  @Transform(({ value }) => parseFloat(value))
  @Column({ type: 'decimal', default: 0.0 })
  weight: number;

  @Transform(({ value }) => parseFloat(value))
  @Column({ type: 'decimal', default: 0.0 })
  height: number;

  @Column({ default: 0 })
  wins: number;

  @Column({ default: 0 })
  losses: number;

  @Column({ default: 0 })
  totalFaults: number;

  @Column()
  profileImagePath: string;

  @OneToMany(() => ParticipantsEntity, (participant) => participant.user)
  participants: ParticipantsEntity[];

  @OneToOne(() => RankingEntity, (ranking) => ranking.user, { cascade: true })
  @JoinColumn({ name: 'rankingId' })
  ranking: RankingEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
