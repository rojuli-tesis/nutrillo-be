import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Registration } from '../registration/schemas/registration.schema';
import { Model } from 'mongoose';

@Injectable()
export class PatientService {
  constructor(
    @Inject('USER_REPOSITORY')
    private usersRepository: Repository<User>,
    @InjectModel(Registration.name)
    private registrationModel: Model<Registration>,
  ) {}

  async listPatients(userId: number): Promise<User[]> {
    return this.usersRepository.find({
      where: { admin: { id: userId } },
    });
  }

  async getPatient(userId: number): Promise<Partial<User>> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { cognitoId, ...data } = user;
    return data;
  }

  async findUserRegistration(userId: number) {
    return this.registrationModel.findOne({ userId });
  }

  async saveRegistrationNotes(userId: number, notes: string, section?: string) {
    const registration = await this.registrationModel.findOne({ userId });
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    if (section) {
      registration.information = registration.information.map((step) => {
        if (step.stepName === section) {
          return { ...step, notes };
        }
        return step;
      });
    } else {
      registration.notes = notes;
    }
    await registration.save();
  }
}
