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

  async findAllByPatient(patientId: string): Promise<any[]> {
    const plans = await this.nutritionPlanModel
      .find({ patientId })
      .sort({ createdAt: -1 })
      .exec();
    
    // Transform dates to ISO strings for frontend compatibility
    return plans.map(plan => {
      const planObj = plan.toObject() as any;
      return {
        ...planObj,
        createdAt: planObj.createdAt.toISOString(),
        updatedAt: planObj.updatedAt.toISOString(),
      };
    });
  }

  async uploadPlan({ file, patientId, adminId, notes = '' }: { file: any; patientId: string; adminId: string; notes: string }): Promise<any> {
    const planId = uuidv4();
    const path = `${adminId}/patients/${patientId}/plans`;
    const url = await this.s3Service.uploadFile(file, path);
    const doc = new this.nutritionPlanModel({
      patientId,
      fileName: file.originalname,
      url,
      notes,
    });
    const savedDoc = await doc.save();
    
    // Transform dates to ISO strings for frontend compatibility
    const savedDocObj = savedDoc.toObject() as any;
    return {
      ...savedDocObj,
      createdAt: savedDocObj.createdAt.toISOString(),
      updatedAt: savedDocObj.updatedAt.toISOString(),
    };
  }

  async getPlanById(planId: string): Promise<any> {
    const plan = await this.nutritionPlanModel.findById(planId);
    if (!plan) {
      throw new Error('Nutrition plan not found');
    }
    
    // Transform dates to ISO strings for frontend compatibility
    const planObj = plan.toObject() as any;
    return {
      ...planObj,
      createdAt: planObj.createdAt.toISOString(),
      updatedAt: planObj.updatedAt.toISOString(),
    };
  }

  async downloadPlan(planId: string): Promise<Buffer> {
    const plan = await this.nutritionPlanModel.findById(planId);
    if (!plan) {
      throw new Error('Nutrition plan not found');
    }

    try {
      const fileBuffer = await this.s3Service.downloadFile(plan.url);
      return fileBuffer;
    } catch (error) {
      console.error('Error downloading file from S3:', error);
      throw new Error('Failed to download file');
    }
  }

  async deletePlan(planId: string): Promise<void> {
    const plan = await this.nutritionPlanModel.findById(planId);
    if (!plan) {
      throw new Error('Nutrition plan not found');
    }

    // Delete the file from S3
    try {
      await this.s3Service.deleteFile(plan.url);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      // Continue with database deletion even if S3 deletion fails
    }

    // Delete from database
    await this.nutritionPlanModel.findByIdAndDelete(planId);
  }
} 