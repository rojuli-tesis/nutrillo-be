import { Body, Controller, Post, Put } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';

@Controller('registration')
export class RegistrationController {
  constructor(private registrationService: RegistrationService) {}

  @Post()
  startRegistration(@Body() createRegistrationDto: CreateRegistrationDto) {
    return this.registrationService.startRegistration(createRegistrationDto);
  }

  @Put()
  updateRegistration(@Body() updateRegistrationDto: UpdateRegistrationDto) {
    return this.registrationService.updateRegistration(updateRegistrationDto);
  }
}
