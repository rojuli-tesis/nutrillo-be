import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FoodLogController } from './food-log.controller';
import { FoodLogService } from './food-log.service';
import { FoodLog, FoodLogSchema } from './schemas/food-log.schema';
import { S3Module } from '../s3/s3.module';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FoodLog.name, schema: FoodLogSchema },
    ]),
    S3Module,
    PointsModule,
  ],
  controllers: [FoodLogController],
  providers: [FoodLogService],
  exports: [FoodLogService],
})
export class FoodLogModule {} 