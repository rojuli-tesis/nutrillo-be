import { Module } from '@nestjs/common';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { DatabaseModule } from '../database/database.module';
import { userProviders } from '../user/user.providers';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Registration,
  RegistrationSchema,
} from '../registration/schemas/registration.schema';

@Module({
  controllers: [PatientController],
  providers: [...userProviders, PatientService],
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Registration.name, schema: RegistrationSchema },
    ]),
  ],
})
export class PatientModule {}
