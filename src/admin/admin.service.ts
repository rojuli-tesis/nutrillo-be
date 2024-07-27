import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import { createAdminDto } from 'src/auth/dto/signup.dto';

@Injectable()
export class AdminService {
  constructor(
    @Inject('ADMIN_REPOSITORY')
    private adminRepository: Repository<Admin>,
  ) {}
  async checkAdminByCognitoId(cognitoId: string): Promise<boolean> {
    const admin = await this.adminRepository.findOne({ where: { cognitoId } });
    return !!admin;
  }

  async findById(id: number): Promise<Admin> {
    return this.adminRepository.findOneBy({ id });
  }

  async findByCognitoId(cognitoId: string): Promise<Admin> {
    return this.adminRepository.findOne({ where: { cognitoId } });
  }

  async create(cognitoId: string, adminData: createAdminDto): Promise<Admin> {
    return this.adminRepository.save({ ...adminData, cognitoId });
  }
}
