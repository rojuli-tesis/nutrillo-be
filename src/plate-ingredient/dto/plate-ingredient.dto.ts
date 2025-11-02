import {
  IsString,
  IsOptional,
  IsObject,
  IsBoolean,
  IsArray,
  IsNumber,
  IsInt,
} from 'class-validator';

export class NutrientsDto {
  @IsOptional()
  @IsNumber()
  energy?: number;

  @IsOptional()
  @IsNumber()
  protein?: number;

  @IsOptional()
  @IsNumber()
  fat?: number;

  @IsOptional()
  @IsNumber()
  saturatedFat?: number;

  @IsOptional()
  @IsNumber()
  carbs?: number;

  @IsOptional()
  @IsNumber()
  sugar?: number;

  @IsOptional()
  @IsNumber()
  fiber?: number;

  @IsOptional()
  @IsNumber()
  sodium?: number;
}

export class DietaryDto {
  @IsOptional()
  @IsBoolean()
  isVegan?: boolean;

  @IsOptional()
  @IsBoolean()
  isVegetarian?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];
}

export class PlateIngredientDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  typeId?: number;

  @IsOptional()
  @IsObject()
  metadata?: any;

  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsObject()
  nutrients?: NutrientsDto;

  @IsOptional()
  @IsObject()
  dietary?: DietaryDto;

  @IsOptional()
  @IsString()
  source?: string;
}

export class CreatePlateIngredientDto extends PlateIngredientDto {}

export class UpdatePlateIngredientDto extends PlateIngredientDto {}

export class PlateIngredientResponseDto extends PlateIngredientDto {
  id: number;
  type?: {
    id: number;
    name: string;
    description?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
