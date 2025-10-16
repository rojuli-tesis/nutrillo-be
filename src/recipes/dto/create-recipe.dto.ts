import { IsString, IsArray, IsEnum, IsNotEmpty, ArrayMinSize, MaxLength } from 'class-validator';

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ingredients: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  instructions: string[];

  @IsString()
  @IsNotEmpty()
  cookingTime: string;

  @IsEnum(['easy', 'medium', 'hard'])
  difficulty: 'easy' | 'medium' | 'hard';

  @IsArray()
  @IsString({ each: true })
  nutritionalBenefits: string[];
}

