import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PatientService } from './patient.service';

interface JwtUser {
  cognitoId: string;
  username: string;
  isAdmin: boolean;
  userId: number;
}

@UseGuards(JwtAuthGuard)
@Controller('patient')
export class PatientController {
  constructor(private patientService: PatientService) {}

  @Get()
  listAllPatients(@Request() req: Express.Request & { user: JwtUser }) {
    return this.patientService.listPatients(req.user.userId);
  }

  @Get('/count')
  async getPatientCount(@Request() req: Express.Request & { user: JwtUser }) {
    const count = await this.patientService.getPatientCount(req.user.userId);
    return { count };
  }

  @Get('/:userId')
  async retrievePatient(@Param('userId') userId: number) {
    const patient = await this.patientService.getPatient(userId);
    const registration = await this.patientService.findUserRegistration(userId);
    return { ...patient, registration };
  }

  @Patch('/:userId/registration-notes')
  async updateRegistration(
    @Param('userId') userId: number,
    @Body('notes') notes: string,
    @Body('section') section?: string,
  ) {
    await this.patientService.saveRegistrationNotes(userId, notes, section);
    return { success: true };
  }
}
