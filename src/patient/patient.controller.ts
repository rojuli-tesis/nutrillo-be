import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RegistrationService } from '../registration/registration.service';
import { PatientService } from './patient.service';

@UseGuards(JwtAuthGuard)
@Controller('patient')
export class PatientController {
  constructor(private patientService: PatientService) {}

  @Get()
  listAllPatients(@Request() req: Express.Request) {
    return this.patientService.listPatients(req.user.userId);
  }

  @Get('/:userId')
  async retrievePatient(@Param('userId') userId: number) {
    const patient = await this.patientService.getPatient(userId);
    const registration = await this.patientService.findUserRegistration(userId);
    return { ...patient, registration };
  }
}
