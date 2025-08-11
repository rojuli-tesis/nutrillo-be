import { IsNumber, IsArray, IsString, IsOptional, Min, Max, ArrayMinSize } from 'class-validator';

export class GenerateRecipeDto {
  @IsNumber()
  plateEvaluationId: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ingredients: string[];

  @IsNumber()
  @Min(1)
  @Max(10)
  evaluationScore: number;

  @IsArray()
  @IsString({ each: true })
  evaluationIssues: string[];
}
