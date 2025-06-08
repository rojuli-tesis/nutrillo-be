import { Module } from '@nestjs/common';
import { AwsCognitoService } from '../auth/aws-cognito.service';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { adminProviders } from './admin.providers';
import { InviteModule } from '../invite/invite.module';

@Module({
  imports: [DatabaseModule, UserModule, InviteModule],
  controllers: [AdminController],
  providers: [...adminProviders, AdminService, AwsCognitoService],
  exports: [AdminService],
})
export class AdminModule {}
