import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { StoreRegistrationStepDto } from './dto/store-registration-step.dto';
import { RegistrationSteps } from './schemas/registration.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from '../user/user.service';

@UseGuards(JwtAuthGuard)
@Controller('registration')
export class RegistrationController {
  constructor(
    private registrationService: RegistrationService,
    private userService: UserService,
  ) {}

  @Post('/:step')
  async saveRegistrationData(
    @Param('step') registrationStep: RegistrationSteps,
    @Body() registrationStepData: StoreRegistrationStepDto,
    @Request() req: Express.Request,
  ) {
    await this.registrationService.updateStep(
      registrationStep,
      registrationStepData,
      req.user.userId,
    );
    if (registrationStepData.saveAndClose) {
      await this.userService.markRegistrationComplete(req.user.userId);
    }
  }

  @Get()
  async retrieveUserRegistration(@Request() req: Express.Request) {
    return this.registrationService.findForUser(req.user.userId);
  }

  @Patch('/abandoned')
  async abandonRegistration(@Request() req: Express.Request) {
    await this.registrationService.abandonProcess(req.user.userId);
  }

  @Get('/:userId')
  async retrievePatientRegistrationData(@Param('userId') userId: number) {
    return this.registrationService.findForUser(userId);
  }
}
