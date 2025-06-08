import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NutritionPlan, NutritionPlanSchema } from './schemas/nutrition-plan.schema';
import { S3Module } from '../s3/s3.module';
import { NutritionPlanService } from './nutrition-plan.service';
import { NutritionPlanController } from './nutrition-plan.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: NutritionPlan.name, schema: NutritionPlanSchema }]),
    S3Module,
  ],
  providers: [NutritionPlanService],
  controllers: [NutritionPlanController],
  exports: [NutritionPlanService],
})
export class NutritionPlanModule {} 