import { DataSource } from 'typeorm';
import { SavedRecipe } from './recipe.entity';

export const recipeProviders = [
  {
    provide: 'SAVED_RECIPE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(SavedRecipe),
    inject: ['DATA_SOURCE'],
  },
];
