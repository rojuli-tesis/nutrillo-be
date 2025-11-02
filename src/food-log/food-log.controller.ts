import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Logger,
} from '@nestjs/common';
import { FoodLogService } from './food-log.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FoodLog } from './schemas/food-log.schema';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard)
@Controller('food-log')
export class FoodLogController {
  private readonly logger = new Logger(FoodLogController.name);

  constructor(private readonly foodLogService: FoodLogService) {}

  @Post('meals')
  @UseInterceptors(FileInterceptor('photo'))
  async createMealLog(
    @Request() req: any,
    @UploadedFile() photo: any,
    @Body()
    mealData: {
      date: string;
      mealType: string;
      description: string;
      notes?: string;
    },
  ) {
    this.logger.log('Received meal log request');
    this.logger.log(`Request body: ${JSON.stringify(mealData)}`);
    this.logger.log(`Photo details:`, {
      exists: !!photo,
      filename: photo?.originalname,
      mimetype: photo?.mimetype,
      size: photo?.size,
      buffer: photo?.buffer ? 'Present' : 'Not present',
    });

    return this.foodLogService.createMealLog(
      req.user?.userId || 1,
      req.user?.adminId,
      {
        ...mealData,
        photo: photo,
      },
    );
  }

  @Post()
  create(@Request() req: any, @Body() foodLogData: Partial<FoodLog>) {
    return this.foodLogService.create(req.user.userId, foodLogData);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.foodLogService.findAll(req.user.userId);
  }

  @Get('patient/:patientId')
  findAllByPatientId(
    @Request() req: any,
    @Param('patientId') patientId: string,
  ) {
    return this.foodLogService.findAll(parseInt(patientId));
  }

  @Get('date')
  findByDate(@Request() req: any, @Query('date') date: string) {
    return this.foodLogService.findByDate(req.user.userId, new Date(date));
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.foodLogService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() foodLogData: Partial<FoodLog>,
  ) {
    return this.foodLogService.update(req.user.userId, id, foodLogData);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.foodLogService.remove(req.user.userId, id);
  }
}
