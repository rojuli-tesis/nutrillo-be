import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { StoreRegistrationStepDto } from './dto/store-registration-step.dto';
import { Registration, RegistrationSteps } from './schemas/registration.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from '../user/user.service';

@UseGuards(JwtAuthGuard)
@Controller('registration')
export class RegistrationController {
  constructor(
    private registrationService: RegistrationService,
    private userService: UserService,
  ) {}

  /**
   * Save registration data for a specific step
   * @param registrationStep The step to save data for
   * @param registrationStepData The data to save
   * @param req The request object containing the user
   * @returns The saved registration data
   */
  @Post('/:step')
  @HttpCode(HttpStatus.OK)
  async saveRegistrationData(
    @Param('step') registrationStep: RegistrationSteps,
    @Body() registrationStepData: StoreRegistrationStepDto,
    @Request() req: Express.Request,
  ): Promise<Registration> {
    const registration = await this.registrationService.updateStep(
      registrationStep,
      registrationStepData,
      req.user.userId,
    );
    
    if (registrationStepData.saveAndClose) {
      await this.userService.markRegistrationComplete(req.user.userId);
    }
    
    return registration;
  }

  /**
   * Retrieve the registration data for the current user
   * @param req The request object containing the user
   * @returns The registration data for the current user
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async retrieveUserRegistration(@Request() req: Express.Request): Promise<Registration | null> {
    return this.registrationService.findForUser(req.user.userId);
  }

  /**
   * Mark the registration process as abandoned
   * @param req The request object containing the user
   * @returns The updated registration data
   */
  @Patch('/abandoned')
  @HttpCode(HttpStatus.OK)
  async abandonRegistration(@Request() req: Express.Request): Promise<Registration> {
    return this.registrationService.abandonProcess(req.user.userId);
  }

  /**
   * Retrieve the registration data for a specific user
   * @param userId The ID of the user
   * @returns The registration data for the specified user
   */
  @Get('/:userId')
  @HttpCode(HttpStatus.OK)
  async retrievePatientRegistrationData(@Param('userId') userId: number): Promise<Registration | null> {
    return this.registrationService.findForUser(userId);
  }
}
