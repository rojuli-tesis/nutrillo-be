import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class GenerateFromEvaluationDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ingredients: string[];

  @IsArray()
  @IsString({ each: true })
  positives: string[];

  @IsArray()
  @IsString({ each: true })
  improvements: string[];
}
