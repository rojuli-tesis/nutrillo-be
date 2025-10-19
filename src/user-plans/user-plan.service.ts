import { Injectable, Logger, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserPlan } from './user-plan.entity';
import { CreateUserPlanDto } from './dto/create-user-plan.dto';
import { UpdateUserPlanDto } from './dto/update-user-plan.dto';
import { UserPlanResponseDto } from './dto/user-plan-response.dto';
import { User } from '../user/user.entity';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class UserPlanService {
  private readonly logger = new Logger(UserPlanService.name);

  constructor(
    @Inject('USER_PLAN_REPOSITORY')
    private userPlanRepository: Repository<UserPlan>,
    private s3Service: S3Service,
  ) {}

  async create(createUserPlanDto: CreateUserPlanDto, userId: number): Promise<UserPlanResponseDto> {
    this.logger.log(`Creating new user plan for user ${userId}`);

    // If setting as active, deactivate all other plans for this user
    if (createUserPlanDto.isActive) {
      await this.deactivateAllUserPlans(userId);
    }

    const userPlan = this.userPlanRepository.create({
      ...createUserPlanDto,
      uploadDate: new Date(createUserPlanDto.uploadDate),
      user: { id: userId } as User,
    });

    const savedUserPlan = await this.userPlanRepository.save(userPlan);

    return this.mapToResponseDto(savedUserPlan);
  }

  async createWithFile(
    createUserPlanDto: CreateUserPlanDto, 
    file: Express.Multer.File, 
    userId: number
  ): Promise<UserPlanResponseDto> {
    this.logger.log(`Creating new user plan with file for user ${userId}`);

    // If setting as active, deactivate all other plans for this user
    if (createUserPlanDto.isActive) {
      await this.deactivateAllUserPlans(userId);
    }

    // Upload file to S3
    const path = `users/${userId}/plans`;
    const fileUrl = await this.s3Service.uploadFile(file, path);

    const userPlan = this.userPlanRepository.create({
      ...createUserPlanDto,
      fileName: file.originalname,
      fileUrl,
      uploadDate: new Date(createUserPlanDto.uploadDate),
      user: { id: userId } as User,
    });

    const savedUserPlan = await this.userPlanRepository.save(userPlan);

    return this.mapToResponseDto(savedUserPlan);
  }

  async findAll(userId: number): Promise<UserPlanResponseDto[]> {
    this.logger.log(`Fetching all user plans for user ${userId}`);

    const userPlans = await this.userPlanRepository.find({
      where: { user: { id: userId } },
      order: { uploadDate: 'DESC' },
      relations: ['user'],
    });

    return userPlans.map(plan => this.mapToResponseDto(plan));
  }

  async findOne(id: string, userId: number): Promise<UserPlanResponseDto> {
    this.logger.log(`Fetching user plan ${id} for user ${userId}`);

    const userPlan = await this.userPlanRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!userPlan) {
      throw new NotFoundException(`User plan with ID ${id} not found`);
    }

    // Check if plan belongs to the user
    if (userPlan.user.id !== userId) {
      throw new ForbiddenException('You do not have permission to access this plan');
    }

    return this.mapToResponseDto(userPlan);
  }

  async update(id: string, updateUserPlanDto: UpdateUserPlanDto, userId: number): Promise<UserPlanResponseDto> {
    this.logger.log(`Updating user plan ${id} for user ${userId}`);

    const userPlan = await this.userPlanRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!userPlan) {
      throw new NotFoundException(`User plan with ID ${id} not found`);
    }

    // Check if plan belongs to the user
    if (userPlan.user.id !== userId) {
      throw new ForbiddenException('You do not have permission to update this plan');
    }

    // If setting as active, deactivate all other plans for this user
    if (updateUserPlanDto.isActive) {
      await this.deactivateAllUserPlans(userId);
    }

    // Update the plan
    Object.assign(userPlan, {
      ...updateUserPlanDto,
      uploadDate: updateUserPlanDto.uploadDate ? new Date(updateUserPlanDto.uploadDate) : userPlan.uploadDate,
    });

    const updatedUserPlan = await this.userPlanRepository.save(userPlan);

    return this.mapToResponseDto(updatedUserPlan);
  }

  async remove(id: string, userId: number): Promise<void> {
    this.logger.log(`Deleting user plan ${id} for user ${userId}`);

    const userPlan = await this.userPlanRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!userPlan) {
      throw new NotFoundException(`User plan with ID ${id} not found`);
    }

    // Check if plan belongs to the user
    if (userPlan.user.id !== userId) {
      throw new ForbiddenException('You do not have permission to delete this plan');
    }

    await this.userPlanRepository.remove(userPlan);
    this.logger.log(`User plan ${id} deleted successfully`);
  }

  async getActivePlan(userId: number): Promise<UserPlanResponseDto | null> {
    this.logger.log(`Fetching active plan for user ${userId}`);

    const activePlan = await this.userPlanRepository.findOne({
      where: { user: { id: userId }, isActive: true },
      relations: ['user'],
    });

    return activePlan ? this.mapToResponseDto(activePlan) : null;
  }

  async setActivePlan(id: string, userId: number): Promise<UserPlanResponseDto> {
    this.logger.log(`Setting user plan ${id} as active for user ${userId}`);

    const userPlan = await this.userPlanRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!userPlan) {
      throw new NotFoundException(`User plan with ID ${id} not found`);
    }

    // Check if plan belongs to the user
    if (userPlan.user.id !== userId) {
      throw new ForbiddenException('You do not have permission to modify this plan');
    }

    // Deactivate all other plans for this user
    await this.deactivateAllUserPlans(userId);

    // Set this plan as active
    userPlan.isActive = true;
    const updatedUserPlan = await this.userPlanRepository.save(userPlan);

    return this.mapToResponseDto(updatedUserPlan);
  }

  private async deactivateAllUserPlans(userId: number): Promise<void> {
    await this.userPlanRepository.update(
      { user: { id: userId } },
      { isActive: false }
    );
  }

  async downloadPlan(id: string, userId: number): Promise<Buffer> {
    this.logger.log(`Downloading user plan ${id} for user ${userId}`);

    const userPlan = await this.userPlanRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });

    if (!userPlan) {
      throw new NotFoundException('User plan not found');
    }

    if (!userPlan.fileUrl) {
      throw new BadRequestException('No file associated with this plan');
    }

    try {
      const fileBuffer = await this.s3Service.downloadFile(userPlan.fileUrl);
      this.logger.log(`User plan ${id} downloaded successfully for user ${userId}`);
      return fileBuffer;
    } catch (error) {
      this.logger.error(`Error downloading user plan ${id} for user ${userId}:`, error);
      throw new BadRequestException('Failed to download file');
    }
  }

  private mapToResponseDto(userPlan: UserPlan): UserPlanResponseDto {
    return {
      id: userPlan.id,
      userId: userPlan.user.id,
      title: userPlan.title,
      description: userPlan.description,
      fileName: userPlan.fileName,
      fileUrl: userPlan.fileUrl,
      nutritionist: userPlan.nutritionist,
      isActive: userPlan.isActive,
      uploadDate: userPlan.uploadDate,
      createdAt: userPlan.createdAt,
      updatedAt: userPlan.updatedAt,
    };
  }
}
