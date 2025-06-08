import { Controller, Get, Param, Post, Body,UploadedFile, UseInterceptors, Request, UseGuards, BadRequestException } from '@nestjs/common';
import { NutritionPlanService } from './nutrition-plan.service';
import { NutritionPlan } from './schemas/nutrition-plan.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('nutrition-plan')
export class NutritionPlanController {
  constructor(private readonly nutritionPlanService: NutritionPlanService) {}

  @Get('patient/:patientId')
  async getAllForPatient(@Param('patientId') patientId: string): Promise<NutritionPlan[]> {
    return this.nutritionPlanService.findAllByPatient(patientId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('patient/:patientId/upload')
  @UseInterceptors(FileInterceptor('document'))
  async uploadPlan(
    @Request() req: any,
    @Param('patientId') patientId: string,
    @Body() notes: string,
    @UploadedFile() file: any,
  ): Promise<NutritionPlan> {
    console.log(file);
    if (!file) throw new BadRequestException('No file uploaded');
    const adminId = req.user?.userId;
    return this.nutritionPlanService.uploadPlan({ file, patientId, adminId, notes });
  }
} 