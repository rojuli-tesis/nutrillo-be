import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { createUserDto } from 'src/auth/dto/signup.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private usersRepository: Repository<User>,
  ) {}

  async create(cognitoId: string, user: createUserDto): Promise<User> {
    return this.usersRepository.save({ cognitoId, isActive: true, ...user });
  }

  async markRegistrationComplete(userId: number) {
    return this.usersRepository.update(userId, {
      isRegistrationFinished: true,
    });
  }

  async findByCognitoId(cognitoId: string): Promise<User> {
    return this.usersRepository.findOne({ where: { cognitoId } });
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
