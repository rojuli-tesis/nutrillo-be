import { Controller, Get, Param, Post, Delete, Body, UploadedFile, UseInterceptors, Request, UseGuards, BadRequestException, HttpException, HttpStatus, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
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
    @Body() body: any,
    @UploadedFile() file: any,
  ): Promise<NutritionPlan> {
    try {
      console.log('Upload request body:', body);
      console.log('Upload file:', file?.originalname);
      
      if (!file) throw new BadRequestException('No file uploaded');
      
      const adminId = req.user?.userId;
      if (!adminId) {
        throw new BadRequestException('Admin ID not found in request');
      }
      
      const notes = body.notes || '';
      
      return await this.nutritionPlanService.uploadPlan({ file, patientId, adminId, notes });
    } catch (error) {
      console.error('Upload error:', error);
      throw new HttpException(
        error.message || 'Error uploading document',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':planId/download')
  async downloadPlan(
    @Param('planId') planId: string,
    @Request() req: any,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    try {
      console.log('Download request for plan:', planId);
      
      if (!planId) {
        throw new BadRequestException('Plan ID is required');
      }
      
      const fileBuffer = await this.nutritionPlanService.downloadPlan(planId);
      const plan = await this.nutritionPlanService.getPlanById(planId);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${plan.fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      });
      
      return new StreamableFile(fileBuffer);
    } catch (error) {
      console.error('Download error:', error);
      throw new HttpException(
        error.message || 'Error downloading nutrition plan',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':planId')
  async deletePlan(
    @Param('planId') planId: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    try {
      console.log('Delete request for plan:', planId);
      
      if (!planId) {
        throw new BadRequestException('Plan ID is required');
      }
      
      await this.nutritionPlanService.deletePlan(planId);
      
      return { message: 'Nutrition plan deleted successfully' };
    } catch (error) {
      console.error('Delete error:', error);
      throw new HttpException(
        error.message || 'Error deleting nutrition plan',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 