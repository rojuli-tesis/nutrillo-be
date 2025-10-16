import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { recipeProviders } from './recipe.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [RecipesController],
  providers: [RecipesService, ...recipeProviders],
  exports: [RecipesService],
})
export class RecipesModule {}

