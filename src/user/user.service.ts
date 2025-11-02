import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { createUserDto } from '../auth/dto/signup.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private usersRepository: Repository<User>,
  ) {}

  async create(cognitoId: string, user: createUserDto): Promise<User> {
    const userCreated = await this.usersRepository.save({
      cognitoId,
      isActive: true,
      ...user,
    });
    // need to save adminID
    return userCreated;
  }

  async markRegistrationComplete(userId: number) {
    return this.usersRepository.update(userId, {
      isRegistrationFinished: true,
    });
  }

  async findByCognitoId(cognitoId: string): Promise<User> {
    return this.usersRepository.findOne({ where: { cognitoId } });
  }

  async getUserById(userId: number): Promise<User> {
    return this.usersRepository.findOne({ where: { id: userId } });
  }

  async getUserAccessStatus(cognitoId: string): Promise<{
    isRegistrationFinished: boolean;
    isActive: boolean;
  }> {
    const { isRegistrationFinished, isActive } =
      await this.findByCognitoId(cognitoId);
    return { isRegistrationFinished, isActive };
  }
}
