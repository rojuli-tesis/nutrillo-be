import { Inject, Injectable } from '@nestjs/common';
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
    return this.usersRepository.save({ cognitoId, ...user });
  }

  async findByCognitoId(cognitoId: string): Promise<User> {
    return this.usersRepository.findOne({ where: { cognitoId } });
  }
}
