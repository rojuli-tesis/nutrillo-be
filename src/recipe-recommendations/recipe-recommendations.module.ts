import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipeRecommendationsController } from './recipe-recommendations.controller';
import { RecipeRecommendationsService } from './recipe-recommendations.service';
import { RecipeRecommendationLog } from './recipe-recommendation-log.entity';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecipeRecommendationLog]),
    PointsModule,
  ],
  controllers: [RecipeRecommendationsController],
  providers: [RecipeRecommendationsService],
  exports: [RecipeRecommendationsService],
})
export class RecipeRecommendationsModule {}
