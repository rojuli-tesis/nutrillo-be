import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { CustomInstructionsService } from './custom-instructions.service';
import { CreateCustomInstructionsDto } from './dto/create-custom-instructions.dto';
import { UpdateCustomInstructionsDto } from './dto/update-custom-instructions.dto';
import { CustomInstructionsResponseDto } from './dto/custom-instructions-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('custom-instructions')
@UseGuards(JwtAuthGuard)
export class CustomInstructionsController {
  private readonly logger = new Logger(CustomInstructionsController.name);

  constructor(private readonly customInstructionsService: CustomInstructionsService) {}

  @Post()
  async create(
    @Body() createCustomInstructionsDto: CreateCustomInstructionsDto,
    @Request() req: any
  ): Promise<CustomInstructionsResponseDto> {
    try {
      this.logger.log(`User ${req.user.userId} creating custom instructions`);
      
      return await this.customInstructionsService.create(
        createCustomInstructionsDto,
        req.user.userId
      );
    } catch (error) {
      this.logger.error(`Error creating custom instructions for user ${req.user.userId}:`, error);
      throw new HttpException(
        error.message || 'Error creating custom instructions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async findAll(@Request() req: any): Promise<CustomInstructionsResponseDto[]> {
    try {
      this.logger.log(`User ${req.user.userId} fetching all custom instructions`);
      
      return await this.customInstructionsService.findAll(req.user.userId);
    } catch (error) {
      this.logger.error(`Error fetching custom instructions for user ${req.user.userId}:`, error);
      throw new HttpException(
        error.message || 'Error fetching custom instructions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('active')
  async findActive(@Request() req: any): Promise<CustomInstructionsResponseDto[]> {
    try {
      this.logger.log(`User ${req.user.userId} fetching active custom instructions`);
      
      return await this.customInstructionsService.findActive(req.user.userId);
    } catch (error) {
      this.logger.error(`Error fetching active custom instructions for user ${req.user.userId}:`, error);
      throw new HttpException(
        error.message || 'Error fetching active custom instructions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<CustomInstructionsResponseDto> {
    try {
      const instructionId = parseInt(id, 10);
      if (isNaN(instructionId)) {
        throw new HttpException('Invalid instruction ID', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`User ${req.user.userId} fetching custom instructions ${instructionId}`);
      
      return await this.customInstructionsService.findOne(instructionId, req.user.userId);
    } catch (error) {
      this.logger.error(`Error fetching custom instructions ${id} for user ${req.user.userId}:`, error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        error.message || 'Error fetching custom instructions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomInstructionsDto: UpdateCustomInstructionsDto,
    @Request() req: any
  ): Promise<CustomInstructionsResponseDto> {
    try {
      const instructionId = parseInt(id, 10);
      if (isNaN(instructionId)) {
        throw new HttpException('Invalid instruction ID', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`User ${req.user.userId} updating custom instructions ${instructionId}`);
      
      return await this.customInstructionsService.update(
        instructionId,
        updateCustomInstructionsDto,
        req.user.userId
      );
    } catch (error) {
      this.logger.error(`Error updating custom instructions ${id} for user ${req.user.userId}:`, error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        error.message || 'Error updating custom instructions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<{ success: boolean; message: string }> {
    try {
      const instructionId = parseInt(id, 10);
      if (isNaN(instructionId)) {
        throw new HttpException('Invalid instruction ID', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`User ${req.user.userId} removing custom instructions ${instructionId}`);
      
      await this.customInstructionsService.remove(instructionId, req.user.userId);
      
      return {
        success: true,
        message: 'Custom instructions deleted successfully'
      };
    } catch (error) {
      this.logger.error(`Error removing custom instructions ${id} for user ${req.user.userId}:`, error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        error.message || 'Error removing custom instructions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
