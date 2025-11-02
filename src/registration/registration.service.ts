import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  /**
   * Updates a registration step for a user
   * @param stepName The name of the step to update
   * @param stepData The data for the step
   * @param userId The ID of the user
   * @returns The updated registration
   */
  async updateStep(
    stepName: RegistrationSteps,
    stepData: StoreRegistrationStepDto,
    userId: number,
  ): Promise<Registration> {
    try {
      const existingRegistration = await this.registrationModel.findOne({
        userId,
      });

      if (!existingRegistration) {
        if (stepName !== RegistrationSteps.PersonalData) {
          throw new BadRequestException(
            'Registration must start with personal data step',
          );
        }
        return await this.createRegistration(stepData, userId);
      } else {
        return await this.updateRegistration(stepName, stepData, userId);
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update registration step: ${error.message}`,
      );
    }
  }

  /**
   * Creates a new registration for a user
   * @param stepData The data for the first step
   * @param userId The ID of the user
   * @returns The created registration
   */
  async createRegistration(
    stepData: StoreRegistrationStepDto,
    userId: number,
  ): Promise<Registration> {
    try {
      const completeData = {
        userId,
        finished: stepData.saveAndClose || false,
        lastStep: RegistrationSteps.PersonalData,
        information: [stepData.data],
      };

      return await this.registrationModel.create(completeData);
    } catch (error) {
      throw new BadRequestException(
        `Failed to create registration: ${error.message}`,
      );
    }
  }

  /**
   * Updates an existing registration for a user
   * @param step The step to update
   * @param updateRegistrationDto The data for the step
   * @param userId The ID of the user
   * @returns The updated registration
   */
  async updateRegistration(
    step: RegistrationSteps,
    updateRegistrationDto: StoreRegistrationStepDto,
    userId: number,
  ): Promise<Registration> {
    try {
      // First, find the existing registration to check if the step already exists
      const existingRegistration = await this.registrationModel.findOne({
        userId,
      });

      if (!existingRegistration) {
        throw new NotFoundException(
          `Registration not found for user ${userId}`,
        );
      }

      // Check if the step already exists in the information array
      const existingStepIndex = existingRegistration.information.findIndex(
        (info) => info.stepName === step,
      );

      let result: Registration;

      if (existingStepIndex >= 0) {
        // Update existing step
        const updateQuery: any = {
          $set: {
            lastStep: step,
            finished: updateRegistrationDto.saveAndClose || false,
            [`information.${existingStepIndex}`]: updateRegistrationDto.data,
          },
        };

        result = await this.registrationModel.findOneAndUpdate(
          { userId },
          updateQuery,
          { new: true },
        );
      } else {
        // Add new step if it doesn't exist
        result = await this.registrationModel.findOneAndUpdate(
          { userId },
          {
            $set: {
              lastStep: step,
              finished: updateRegistrationDto.saveAndClose || false,
            },
            $push: {
              information: updateRegistrationDto.data,
            },
          },
          { new: true },
        );
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update registration: ${error.message}`,
      );
    }
  }

  /**
   * Finds a registration for a user
   * @param userId The ID of the user
   * @returns The registration for the user
   */
  async findForUser(userId: number): Promise<Registration | null> {
    try {
      return await this.registrationModel.findOne({ userId });
    } catch (error) {
      throw new BadRequestException(
        `Failed to find registration: ${error.message}`,
      );
    }
  }

  /**
   * Marks a registration as abandoned
   * @param userId The ID of the user
   * @returns The updated registration
   */
  async abandonProcess(userId: number): Promise<Registration> {
    try {
      const result = await this.registrationModel.findOneAndUpdate(
        { userId },
        { $set: { finished: true } },
        { new: true },
      );

      if (!result) {
        throw new NotFoundException(
          `Registration not found for user ${userId}`,
        );
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to abandon registration: ${error.message}`,
      );
    }
  }
}
