import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NutritionPlanDocument = NutritionPlan & Document;

@Schema({ timestamps: true })
export class NutritionPlan {
  @Prop({ required: true })
  patientId: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  url: string;

  @Prop()
  notes: string;
}

export const NutritionPlanSchema = SchemaFactory.createForClass(NutritionPlan);
