import { IsBoolean, IsNotEmpty, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RegistrationStep, RegistrationSteps } from '../schemas/registration.schema';

export class StoreRegistrationStepDto {
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  data: RegistrationStep;

  @IsBoolean()
  @IsOptional()
  saveAndClose?: boolean = false;
}
