import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { RegistrationStep } from '../schemas/registration.schema';

export class StoreRegistrationStepDto {
  @IsNotEmpty()
  data: RegistrationStep;
  @IsBoolean()
  @IsOptional()
  saveAndClose: boolean;
}
