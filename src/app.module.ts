import { Module } from '@nestjs/common';
import { RegistrationModule } from './registration/registration.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { InviteModule } from './invite/invite.module';
import { PatientModule } from './patient/patient.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.development.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot('mongodb://localhost/nutrillo-db'), // Mongodb
    DatabaseModule, // Postgres
    RegistrationModule,
    AuthModule,
    UserModule,
    AdminModule,
    InviteModule,
    PatientModule,
  ],
  providers: [],
})
export class AppModule {}
