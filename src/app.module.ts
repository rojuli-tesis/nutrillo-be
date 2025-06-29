import { Module } from '@nestjs/common';
import { RegistrationModule } from './registration/registration.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { InviteModule } from './invite/invite.module';
import { PatientModule } from './patient/patient.module';
import { FoodLogModule } from './food-log/food-log.module';
import { NutritionPlanModule } from './nutrition-plan/nutrition-plan.module';
import { PlateIngredientModule } from './plate-ingredient/plate-ingredient.module';
import { PlateEvaluatorModule } from './plate-evaluator/plate-evaluator.module';

const envFilePath = `.env.${process.env.NODE_ENV}` || '.env.development';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: envFilePath,
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }), // Mongodb
    DatabaseModule, // Postgres
    RegistrationModule,
    AuthModule,
    UserModule,
    AdminModule,
    InviteModule,
    PatientModule,
    FoodLogModule,
    NutritionPlanModule,
    PlateIngredientModule,
    PlateEvaluatorModule,
  ],
  providers: [],
})
export class AppModule {}
