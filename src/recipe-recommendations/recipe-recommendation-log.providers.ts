import { DataSource } from 'typeorm';
import { RecipeRecommendationLog } from './recipe-recommendation-log.entity';

export const recipeRecommendationLogProviders = [
  {
    provide: 'RECIPE_RECOMMENDATION_LOG_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(RecipeRecommendationLog),
    inject: ['DATA_SOURCE'],
  },
];
