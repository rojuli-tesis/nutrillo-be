import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';

export enum ActivityType {
  MEAL_LOG = 'meal_log',
  PLATE_EVALUATION = 'plate_evaluation',
  STREAK_BONUS = 'streak_bonus',
  RECIPE_RECOMMENDATION = 'recipe_recommendation'
}

@Entity('point_transactions')
export class PointTransactions {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: ActivityType,
    nullable: false
  })
  activityType: ActivityType;

  @Column({ type: 'int' })
  pointsEarned: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  streakMultiplier: number;

  @Column({ type: 'int' })
  basePoints: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int', nullable: true })
  relatedEntityId: number;

  @CreateDateColumn()
  createdAt: Date;
}
