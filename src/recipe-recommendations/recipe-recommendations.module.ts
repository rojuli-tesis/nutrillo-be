import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RecipeRecommendationsController } from './recipe-recommendations.controller';
import { RecipeRecommendationsService } from './recipe-recommendations.service';
import { recipeRecommendationLogProviders } from './recipe-recommendation-log.providers';
import { DatabaseModule } from '../database/database.module';
import { PointsModule } from '../points/points.module';
import { CustomInstructionsModule } from '../custom-instructions/custom-instructions.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    PointsModule,
    CustomInstructionsModule,
  ],
  controllers: [RecipeRecommendationsController],
  providers: [
    RecipeRecommendationsService,
    ...recipeRecommendationLogProviders,
  ],
  exports: [RecipeRecommendationsService],
})
export class RecipeRecommendationsModule {}
