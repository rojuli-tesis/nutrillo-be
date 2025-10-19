import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

interface StepBase {
  notes: string;
}

export interface PersonalData extends StepBase {
  firstName: string;
  lastName: string;
  dob: Date;
  objectives: string;
  stepName: string;
}

export interface PhysicalActivity extends StepBase {
  intensity: string;
  height: number;
  weight: number;
  diet: string;
  stepName: string;
}

export interface HealthStatus extends StepBase {
  diagnosedSickness: string;
  medications: string;
  weightLossMedications: string;
  stepName: string;
}

export interface DietDetails extends StepBase {
  liquids: string[];
  sweets: string[];
  snacks: string[];
  sweeteners: string[];
  fats: string[];
  dairy: string[];
  stepName: string;
}

export interface RoutineDetails extends StepBase {
  mealsADay: number;
  householdShopper: string;
  starvingHours: string;
  preferredFoods: string[];
  dislikedFoods: string[];
  breakfastTime: string;
  breakfastDetails: string;
  midMorningSnackTime: string;
  midMorningSnackDetails: string;
  lunchTime: string;
  lunchDetails: string;
  afternoonSnackTime: string;
  afternoonSnackDetails: string;
  dinnerTime: string;
  dinnerDetails: string;
  stepName: string;
}

export interface ExtraDetails extends StepBase {
  sedentaryLevel: string;
  workouts: {
    type: string;
    frequency: string;
    duration: string;
    startingYear: number;
    place: string;
  }[];
  alcohol: string;
  smoking: string;
  supplements: string;
  stepName: string;
}

export enum RegistrationSteps {
  PersonalData = 'personalData',
  CurrentStatus = 'currentStatus',
  HealthStatus = 'healthStatus',
  DietOne = 'diet-one',
  DietTwo = 'diet-two',
  DietThree = 'diet-three',
  DietFour = 'diet-four',
  RoutineOne = 'routine-one',
  RoutineTwo = 'routine-two',
  RoutineThree = 'routine-three',
  RoutineFour = 'routine-four',
  Exercise = 'exercise',
  Lifestyle = 'lifestyle',
}

export type RegistrationStep =
  | PersonalData
  | CurrentStatus
  | HealthStatus
  | DietOne
  | DietTwo
  | DietThree
  | DietFour
  | RoutineOne
  | RoutineTwo
  | RoutineThree
  | RoutineFour
  | Exercise
  | Lifestyle;

export type RegistrationDocument = HydratedDocument<Registration>;

@Schema({ timestamps: true })
export class Registration {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ type: [Object], required: true })
  information: RegistrationStep[];

  @Prop({ required: true, enum: RegistrationSteps })
  lastStep: RegistrationSteps;

  @Prop({ default: false })
  finished: boolean;

  @Prop()
  notes: string;
}

export const RegistrationSchema = SchemaFactory.createForClass(Registration);
