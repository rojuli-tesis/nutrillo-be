import { Module } from '@nestjs/common';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Registration,
  RegistrationSchema,
} from './schemas/registration.schema';
import { userProviders } from '../user/user.providers';
import { DatabaseModule } from '../database/database.module';
import { UserService } from '../user/user.service';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Registration.name, schema: RegistrationSchema },
    ]),
  ],
  controllers: [RegistrationController],
  providers: [...userProviders, UserService, RegistrationService],
  exports: [RegistrationService],
})
export class RegistrationModule {}
