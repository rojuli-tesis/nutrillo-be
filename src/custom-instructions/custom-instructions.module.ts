import { Module } from '@nestjs/common';
import { CustomInstructionsService } from './custom-instructions.service';
import { CustomInstructionsController } from './custom-instructions.controller';
import { customInstructionsProviders } from './custom-instructions.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CustomInstructionsController],
  providers: [CustomInstructionsService, ...customInstructionsProviders],
  exports: [CustomInstructionsService],
})
export class CustomInstructionsModule {}
