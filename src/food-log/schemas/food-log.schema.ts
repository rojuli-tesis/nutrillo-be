import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FoodLogDocument = FoodLog & Document;

@Schema({ timestamps: true })
export class FoodLog {
  @Prop({ required: true })
  patientId: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  mealType: string; // breakfast, lunch, dinner, snack

  @Prop()
  description: string;

  @Prop()
  photoUrl?: string;

  @Prop()
  notes?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const FoodLogSchema = SchemaFactory.createForClass(FoodLog); 