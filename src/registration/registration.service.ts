import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Registration, RegistrationSteps } from './schemas/registration.schema';
import { Model } from 'mongoose';
import { StoreRegistrationStepDto } from './dto/store-registration-step.dto';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectModel(Registration.name)
    private registrationModel: Model<Registration>,
  ) {}

  async updateStep(
    stepName: RegistrationSteps,
    stepData: StoreRegistrationStepDto,
    userId: number,
  ) {
    const existingRegistration = await this.registrationModel.findOne({
      userId,
    });
    if (!existingRegistration) {
      if (stepName !== RegistrationSteps.PersonalData) {
        throw new BadRequestException();
      }
      await this.createRegistration(stepData, userId);
    } else {
      await this.updateRegistration(stepName, stepData, userId);
    }
  }

  createRegistration(stepData: StoreRegistrationStepDto, userId: number) {
    const completeData = {
      userId,
      finished: stepData.saveAndClose,
      lastStep: RegistrationSteps.PersonalData,
      information: [stepData.data],
    };

    return this.registrationModel.create(completeData);
  }

  updateRegistration(
    step: RegistrationSteps,
    updateRegistrationDto: StoreRegistrationStepDto,
    userId: number,
  ) {
    const changeStep = step.replace('-', '/');
    return this.registrationModel.updateOne(
      { userId },
      {
        $set: {
          lastStep: changeStep,
          finished: updateRegistrationDto.saveAndClose,
        },
        $push: {
          information: updateRegistrationDto.data,
        },
      },
    );
  }

  findForUser(userId: number) {
    return this.registrationModel.findOne({ userId });
  }

  abandonProcess(userId: number) {
    return this.registrationModel.updateOne(
      {
        userId,
      },
      {
        $set: {
          finished: true,
        },
      },
    );
  }
}
