import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlateEvaluatorController } from './plate-evaluator.controller';
import { PlateEvaluatorService } from './plate-evaluator.service';

@Module({
  imports: [ConfigModule],
  controllers: [PlateEvaluatorController],
  providers: [PlateEvaluatorService],
  exports: [PlateEvaluatorService],
})
export class PlateEvaluatorModule {} 