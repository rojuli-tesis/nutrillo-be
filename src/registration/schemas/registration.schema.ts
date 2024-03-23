import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export interface PersonalData {
  firstName: string;
  lastName: string;
  dob: Date;
  objectives: string;
}

export interface PhysicalActivity {
  intensity: string;
  height: number;
  weight: number;
  diet: string;
}

export interface HealthStatus {
  diagnosedSickness: string;
  medications: string;
  weightLossMedications: string;
}

export interface DietDetails {
  liquids: string[];
  sweets: string[];
  snacks: string[];
  sweeteners: string[];
  fats: string[];
  dairy: string[];
}

export interface RoutineDetails {
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
}

export interface ExtraDetails {
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
}

export type RegistrationStep =
  | PersonalData
  | PhysicalActivity
  | HealthStatus
  | DietDetails
  | RoutineDetails
  | ExtraDetails;

export type RegistrationDocument = HydratedDocument<Registration>;

@Schema()
export class Registration {
  @Prop()
  userId: string;
  @Prop()
  information: RegistrationStep[];
  @Prop()
  lastStep: string;
  @Prop()
  finished: boolean;
}

export const RegistrationSchema = SchemaFactory.createForClass(Registration);
