import { IsNotEmpty } from 'class-validator';
import { PersonalData } from '../schemas/registration.schema';

export class CreateRegistrationDto {
  userId: string;
  @IsNotEmpty()
  information: PersonalData;
  finished: boolean;
}
