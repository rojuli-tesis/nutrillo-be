import { Module } from '@nestjs/common';
import { PlateIngredient } from './plate-ingredient.entity';
import { IngredientType } from './ingredient-type.entity';
import { IngredientSubtype } from './ingredient-subtype.entity';
import { PlateIngredientService } from './plate-ingredient.service';
import { IngredientTypeService } from './ingredient-type.service';
import { IngredientSubtypeService } from './ingredient-subtype.service';
import { PlateIngredientController } from './plate-ingredient.controller';
import { IngredientTypeController } from './ingredient-type.controller';
import { DatabaseModule } from '../database/database.module';
import { DataSource } from 'typeorm';
import { S3Module } from '../s3/s3.module';

const plateIngredientProviders = [
  {
    provide: 'PLATE_INGREDIENT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(PlateIngredient),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'INGREDIENT_TYPE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(IngredientType),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'INGREDIENT_SUBTYPE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(IngredientSubtype),
    inject: ['DATA_SOURCE'],
  },
];

@Module({
  imports: [DatabaseModule, S3Module],
  providers: [
    ...plateIngredientProviders,
    PlateIngredientService,
    IngredientTypeService,
    IngredientSubtypeService,
  ],
  controllers: [PlateIngredientController, IngredientTypeController],
  exports: [PlateIngredientService, IngredientTypeService, IngredientSubtypeService],
})
export class PlateIngredientModule {} 