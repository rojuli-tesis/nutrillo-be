import { IsString, IsOptional, IsBoolean, IsNumber, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateCustomInstructionsDto {
  @IsString()
  @IsNotEmpty()
  instructions: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  priority?: number;
}
