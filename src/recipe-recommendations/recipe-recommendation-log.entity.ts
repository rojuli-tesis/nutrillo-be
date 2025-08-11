import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('recipe_recommendation_logs')
export class RecipeRecommendationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int' })
  plateEvaluationId: number;

  @Column({ type: 'simple-array' })
  ingredients: string[];

  @Column({ type: 'int' })
  evaluationScore: number;

  @Column({ type: 'simple-array' })
  evaluationIssues: string[];

  @Column({ type: 'json', nullable: true })
  recipes: any[];

  @Column({ type: 'int' })
  pointsSpent: number;

  @Column({ type: 'boolean', default: false })
  isSuccess: boolean;

  @Column({ type: 'json', nullable: true })
  openaiRequest: any;

  @Column({ type: 'json', nullable: true })
  openaiResponse: any;

  @Column({ type: 'int', nullable: true })
  promptTokens: number;

  @Column({ type: 'int', nullable: true })
  completionTokens: number;

  @Column({ type: 'int', nullable: true })
  totalTokens: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
