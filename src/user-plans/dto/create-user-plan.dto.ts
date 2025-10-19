import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString, MaxLength } from 'class-validator';

export class CreateUserPlanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  fileUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  nutritionist?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsNotEmpty()
  uploadDate: string;
}
