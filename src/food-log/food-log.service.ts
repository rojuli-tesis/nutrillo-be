import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FoodLog, FoodLogDocument } from './schemas/food-log.schema';
import { S3Service } from '../s3/s3.service';
import { PointsService } from '../points/points.service';

@Injectable()
export class FoodLogService {
  private readonly logger = new Logger(FoodLogService.name);

  constructor(
    @InjectModel(FoodLog.name)
    private foodLogModel: Model<FoodLogDocument>,
    private s3Service: S3Service,
    private pointsService: PointsService,
  ) {}

  async create(
    patientId: number,
    foodLogData: Partial<FoodLog>,
  ): Promise<FoodLog> {
    const foodLog = new this.foodLogModel({
      ...foodLogData,
      patientId,
    });
    return foodLog.save();
  }

  async findAll(patientId: number): Promise<FoodLog[]> {
    return this.foodLogModel
      .find({ patientId, isActive: true })
      .sort({ date: -1 });
  }

  async findOne(patientId: number, id: string): Promise<FoodLog> {
    const foodLog = await this.foodLogModel.findOne({
      _id: id,
      patientId,
      isActive: true,
    });
    if (!foodLog) {
      throw new NotFoundException(`Food log with ID ${id} not found`);
    }
    return foodLog;
  }

  async findByDate(patientId: number, date: Date): Promise<FoodLog[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.foodLogModel
      .find({
        patientId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        isActive: true,
      })
      .sort({ date: 1 });
  }

  async update(
    patientId: number,
    id: string,
    foodLogData: Partial<FoodLog>,
  ): Promise<FoodLog> {
    const foodLog = await this.foodLogModel.findOneAndUpdate(
      { _id: id, patientId, isActive: true },
      { $set: foodLogData },
      { new: true },
    );
    if (!foodLog) {
      throw new NotFoundException(`Food log with ID ${id} not found`);
    }
    return foodLog;
  }

  async remove(patientId: number, id: string): Promise<void> {
    const result = await this.foodLogModel.findOneAndUpdate(
      { _id: id, patientId, isActive: true },
      { $set: { isActive: false } },
      { new: true },
    );
    if (!result) {
      throw new NotFoundException(`Food log with ID ${id} not found`);
    }
  }

  async createMealLog(
    userId: number,
    adminId: string,
    mealData: {
      date: string;
      mealType: string;
      description: string;
      notes?: string;
      photo?: any;
    },
  ) {
    this.logger.log('Creating meal log with data:', {
      userId,
      date: mealData.date,
      mealType: mealData.mealType,
      hasPhoto: !!mealData.photo,
    });

    let photoUrl: string | undefined;

    if (mealData.photo) {
      try {
        this.logger.log('Uploading photo to S3...');
        const path = `${adminId}/patients/${userId}/logs`;
        photoUrl = await this.s3Service.uploadFile(mealData.photo, path);
        this.logger.log('Photo uploaded successfully:', photoUrl);
      } catch (error) {
        this.logger.error('Failed to upload photo:', error);
        // Continue without the photo if upload fails
      }
    }

    const foodLog = new this.foodLogModel({
      patientId: userId,
      date: new Date(mealData.date),
      mealType: mealData.mealType,
      description: mealData.description,
      notes: mealData.notes,
      photoUrl,
      isActive: true,
    });

    const savedFoodLog = await foodLog.save();

    // Award points for meal logging
    try {
      const pointsResult = await this.pointsService.awardMealLogPoints(
        userId,
        !!photoUrl,
        savedFoodLog._id,
      );

      // Update the food log with points information
      await this.foodLogModel.findByIdAndUpdate(savedFoodLog._id, {
        pointsEarned: pointsResult.pointsEarned,
        streakMultiplier: pointsResult.multiplier,
      });

      this.logger.log(
        `Awarded ${pointsResult.pointsEarned} points to user ${userId} for meal log`,
      );
    } catch (error) {
      this.logger.error('Failed to award points for meal log:', error);
      // Don't fail the meal log creation if points awarding fails
    }

    return savedFoodLog;
  }
}

export class CreateMealLogDto {
  date: string;
  mealType: string;
  description: string;
  notes?: string;
  photo?: any;
}
