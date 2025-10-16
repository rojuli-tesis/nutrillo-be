import { Injectable, Logger, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CustomInstructions } from './custom-instructions.entity';
import { CreateCustomInstructionsDto } from './dto/create-custom-instructions.dto';
import { UpdateCustomInstructionsDto } from './dto/update-custom-instructions.dto';
import { CustomInstructionsResponseDto } from './dto/custom-instructions-response.dto';

@Injectable()
export class CustomInstructionsService {
  private readonly logger = new Logger(CustomInstructionsService.name);

  constructor(
    @Inject('CUSTOM_INSTRUCTIONS_REPOSITORY')
    private customInstructionsRepository: Repository<CustomInstructions>,
  ) {}

  async create(
    createCustomInstructionsDto: CreateCustomInstructionsDto,
    userId: number
  ): Promise<CustomInstructionsResponseDto> {
    this.logger.log(`Creating custom instructions for user ${userId}`);

    const customInstructions = this.customInstructionsRepository.create({
      ...createCustomInstructionsDto,
      user: { id: userId } as any,
    });

    const saved = await this.customInstructionsRepository.save(customInstructions);
    
    this.logger.log(`Created custom instructions ${saved.id} for user ${userId}`);
    
    return this.mapToResponseDto(saved);
  }

  async findAll(userId: number): Promise<CustomInstructionsResponseDto[]> {
    this.logger.log(`Fetching all custom instructions for user ${userId}`);

    const instructions = await this.customInstructionsRepository.find({
      where: { user: { id: userId } },
      order: { priority: 'DESC', createdAt: 'DESC' },
    });

    return instructions.map(instruction => this.mapToResponseDto(instruction));
  }

  async findActive(userId: number): Promise<CustomInstructionsResponseDto[]> {
    this.logger.log(`Fetching active custom instructions for user ${userId}`);

    const instructions = await this.customInstructionsRepository.find({
      where: { user: { id: userId }, isActive: true },
      order: { priority: 'DESC', createdAt: 'DESC' },
    });

    return instructions.map(instruction => this.mapToResponseDto(instruction));
  }

  async findOne(id: number, userId: number): Promise<CustomInstructionsResponseDto> {
    this.logger.log(`Fetching custom instructions ${id} for user ${userId}`);

    const instruction = await this.customInstructionsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!instruction) {
      throw new Error('Custom instructions not found');
    }

    return this.mapToResponseDto(instruction);
  }

  async update(
    id: number,
    updateCustomInstructionsDto: UpdateCustomInstructionsDto,
    userId: number
  ): Promise<CustomInstructionsResponseDto> {
    this.logger.log(`Updating custom instructions ${id} for user ${userId}`);

    const instruction = await this.customInstructionsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!instruction) {
      throw new Error('Custom instructions not found');
    }

    Object.assign(instruction, updateCustomInstructionsDto);
    const updated = await this.customInstructionsRepository.save(instruction);
    
    this.logger.log(`Updated custom instructions ${id} for user ${userId}`);
    
    return this.mapToResponseDto(updated);
  }

  async remove(id: number, userId: number): Promise<void> {
    this.logger.log(`Removing custom instructions ${id} for user ${userId}`);

    const result = await this.customInstructionsRepository.delete({
      id,
      user: { id: userId },
    });

    if (result.affected === 0) {
      throw new Error('Custom instructions not found');
    }

    this.logger.log(`Removed custom instructions ${id} for user ${userId}`);
  }

  async getActiveInstructionsForUser(userId: number): Promise<string[]> {
    this.logger.log(`Getting active instructions text for user ${userId}`);

    const instructions = await this.customInstructionsRepository.find({
      where: { user: { id: userId }, isActive: true },
      order: { priority: 'DESC', createdAt: 'DESC' },
      select: ['instructions'],
    });

    this.logger.log(`Found ${instructions.length} active instructions in database for user ${userId}`);
    const instructionTexts = instructions.map(instruction => instruction.instructions);
    this.logger.log(`Returning instruction texts: ${JSON.stringify(instructionTexts)}`);
    
    return instructionTexts;
  }

  private mapToResponseDto(instruction: CustomInstructions): CustomInstructionsResponseDto {
    return {
      id: instruction.id,
      instructions: instruction.instructions,
      title: instruction.title,
      description: instruction.description,
      isActive: instruction.isActive,
      priority: instruction.priority,
      createdAt: instruction.createdAt,
      updatedAt: instruction.updatedAt,
    };
  }
}
