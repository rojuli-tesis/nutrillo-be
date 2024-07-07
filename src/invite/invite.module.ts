import { Module } from '@nestjs/common';
import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';
import { inviteProviders } from './invite.providers';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [InviteController],
  providers: [...inviteProviders, InviteService],
  exports: [InviteService],
})
export class InviteModule {}
