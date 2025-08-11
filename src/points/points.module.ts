import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';
import { pointsProviders } from './points.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [PointsController],
  providers: [...pointsProviders, PointsService],
  exports: [PointsService],
})
export class PointsModule {}
