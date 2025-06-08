import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NutritionPlan, NutritionPlanDocument } from './schemas/nutrition-plan.schema';
import { S3Service } from '../s3/s3.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NutritionPlanService {
  constructor(
    @InjectModel(NutritionPlan.name)
    private nutritionPlanModel: Model<NutritionPlanDocument>,
    private s3Service: S3Service,
  ) {}

  async findAllByPatient(patientId: string): Promise<NutritionPlan[]> {
    return this.nutritionPlanModel
      .find({ patientId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async uploadPlan({ file, patientId, adminId, notes = '' }: { file: any; patientId: string; adminId: string; notes: string }): Promise<NutritionPlan> {
    const planId = uuidv4();
    const path = `${adminId}/patients/${patientId}/plans`;
    const url = await this.s3Service.uploadFile(file, path);
    const doc = new this.nutritionPlanModel({
      patientId,
      fileName: file.originalname,
      url,
      notes,
    });
    return doc.save();
  }
} 