import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserPlanController } from './user-plan.controller';
import { UserPlanService } from './user-plan.service';
import { userPlanProviders } from './user-plan.providers';
import { DatabaseModule } from '../database/database.module';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [ConfigModule, DatabaseModule, S3Module],
  controllers: [UserPlanController],
  providers: [UserPlanService, ...userPlanProviders],
  exports: [UserPlanService],
})
export class UserPlanModule {}
