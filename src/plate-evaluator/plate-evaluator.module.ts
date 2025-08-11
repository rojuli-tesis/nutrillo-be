import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlateEvaluatorController } from './plate-evaluator.controller';
import { PlateEvaluatorService } from './plate-evaluator.service';
import { plateEvaluationLogProviders } from './plate-evaluation-log.providers';
import { DatabaseModule } from '../database/database.module';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [ConfigModule, DatabaseModule, PointsModule],
  controllers: [PlateEvaluatorController],
  providers: [
    PlateEvaluatorService,
    ...plateEvaluationLogProviders,
  ],
  exports: [PlateEvaluatorService],
})
export class PlateEvaluatorModule {} 