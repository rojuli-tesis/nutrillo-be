import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

interface OpenAIRequest {
  model: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
  max_tokens: number;
  temperature: number;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Entity('plate_evaluation_log')
export class PlateEvaluationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'json' })
  ingredients: Array<{
    name: string;
    type: string;
    subtype?: string;
  }>;

  // Only store full request/response for failed requests (debugging)
  @Column({ type: 'json', nullable: true })
  openaiRequest: OpenAIRequest;

  @Column({ type: 'json', nullable: true })
  openaiResponse: OpenAIResponse;

  // For successful requests, only store the essentials
  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  score: number;

  @Column({ type: 'json', nullable: true })
  positives: string[];

  @Column({ type: 'json', nullable: true })
  issues: string[];

  @Column({ type: 'text', nullable: true })
  suggestions: string;

  @Column({ default: false })
  isSuccess: boolean;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  // Track API usage for analytics without storing full payload
  @Column({ nullable: true })
  promptTokens: number;

  @Column({ nullable: true })
  completionTokens: number;

  @Column({ nullable: true })
  totalTokens: number;

  @Column({ default: false })
  isVisibleToUser: boolean; // For favorites/saved recipes

  @Column({ default: false })
  isHiddenFromNutritionist: boolean; // For nutritionist to hide uninteresting plates

  @Column({ type: 'text', nullable: true })
  userNotes: string; // For user to add their own notes

  @Column({ type: 'text', nullable: true })
  nutritionistNotes: string; // For nutritionist to add notes for patient education

  @Column({ type: 'int', default: 0 })
  pointsEarned: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  streakMultiplier: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
