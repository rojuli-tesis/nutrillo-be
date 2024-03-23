import { Injectable } from '@nestjs/common';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Registration } from './schemas/registration.schema';
import { Model } from 'mongoose';
import { UpdateRegistrationDto } from './dto/update-registration.dto';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectModel(Registration.name)
    private registrationModel: Model<Registration>,
  ) {}

  /**
   * First ever created registration for individual
   * @param {CreateRegistrationDto} createRegistrationDto
   * @returns {Registration}
   */
  startRegistration(
    createRegistrationDto: CreateRegistrationDto,
  ): Promise<Registration> {
    const completeData = {
      userId: createRegistrationDto.userId,
      finished: false,
      lastStep: 'personalData',
      information: [createRegistrationDto.information],
    };
    return this.registrationModel.create(completeData);
  }

  // /**
  //  * Given a user id, returns their registration data
  //  *
  //  * @param {string} userId
  //  * @returns {Registration}
  //  */
  // getRegistrationDataForUser(userId: string): Registration {
  //   return this.registrations.find((reg) => reg.userId === userId);
  // }

  updateRegistration(updateRegistrationDto: UpdateRegistrationDto) {
    return this.registrationModel.updateOne(
      { userId: updateRegistrationDto.userId },
      {
        $set: {
          lastStep: updateRegistrationDto.step,
          finished: updateRegistrationDto.finished,
        },
        $push: {
          information: updateRegistrationDto.information,
        },
      },
    );
  }

  // // Individual finishes registration in whatever step they are
  // setRegistrationAsFinished(userId: string) {
  //   const registration = this.registrations.find(
  //     (reg) => reg.userId === userId,
  //   );
  //   registration.finished = true;
  // }

  // Individual returns to a previous step in the registration process and changes data
  updateRegistrationStep() {}
}
