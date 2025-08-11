import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from '../user/user.entity';

export enum ActivityType {
  MEAL_LOG = 'meal_log',
  PLATE_EVALUATION = 'plate_evaluation',
  BOTH = 'both'
}

@Entity('daily_activity')
@Index(['user', 'activityDate'], { unique: true })
export class DailyActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date', nullable: false })
  activityDate: Date;

  @Column({
    type: 'enum',
    enum: ActivityType,
    nullable: false
  })
  activityType: ActivityType;

  @Column({ type: 'int', default: 0 })
  mealLogCount: number;

  @Column({ type: 'int', default: 0 })
  plateEvaluationCount: number;

  @Column({ type: 'int', default: 0 })
  totalPointsEarned: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  averageMultiplier: number;

  @CreateDateColumn()
  createdAt: Date;
}

