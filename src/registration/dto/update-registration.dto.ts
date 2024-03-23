import { IsNotEmpty } from 'class-validator';
import { RegistrationStep } from '../schemas/registration.schema';

export class UpdateRegistrationDto {
  userId: string;
  step: string;
  @IsNotEmpty()
  information: RegistrationStep;
  finished: boolean;
}
