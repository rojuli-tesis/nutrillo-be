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
  HttpCode, 
  HttpStatus, 
  Logger,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  StreamableFile
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserPlanService } from './user-plan.service';
import { CreateUserPlanDto } from './dto/create-user-plan.dto';
import { UpdateUserPlanDto } from './dto/update-user-plan.dto';
import { UserPlanResponseDto } from './dto/user-plan-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface JwtUser {
  sub: string;
  email: string;
  userId: number;
}

@Controller('user-plans')
@UseGuards(JwtAuthGuard)
export class UserPlanController {
  private readonly logger = new Logger(UserPlanController.name);

  constructor(private readonly userPlanService: UserPlanService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createUserPlanDto: CreateUserPlanDto,
    @Request() req: Express.Request & { user: JwtUser }
  ): Promise<UserPlanResponseDto> {
    this.logger.log(`User ${req.user.userId} creating new user plan`);
    return await this.userPlanService.create(createUserPlanDto, req.user.userId);
  }

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async createWithFile(
    @Body() createUserPlanDto: CreateUserPlanDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: Express.Request & { user: JwtUser }
  ): Promise<UserPlanResponseDto> {
    this.logger.log(`User ${req.user.userId} creating new user plan with file`);
    
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return await this.userPlanService.createWithFile(createUserPlanDto, file, req.user.userId);
  }

  @Get()
  async findAll(
    @Request() req: Express.Request & { user: JwtUser }
  ): Promise<UserPlanResponseDto[]> {
    this.logger.log(`User ${req.user.userId} fetching all user plans`);
    return await this.userPlanService.findAll(req.user.userId);
  }

  @Get('active')
  async getActivePlan(
    @Request() req: Express.Request & { user: JwtUser }
  ): Promise<UserPlanResponseDto | null> {
    this.logger.log(`User ${req.user.userId} fetching active plan`);
    return await this.userPlanService.getActivePlan(req.user.userId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: Express.Request & { user: JwtUser }
  ): Promise<UserPlanResponseDto> {
    this.logger.log(`User ${req.user.userId} fetching user plan ${id}`);
    return await this.userPlanService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserPlanDto: UpdateUserPlanDto,
    @Request() req: Express.Request & { user: JwtUser }
  ): Promise<UserPlanResponseDto> {
    this.logger.log(`User ${req.user.userId} updating user plan ${id}`);
    return await this.userPlanService.update(id, updateUserPlanDto, req.user.userId);
  }

  @Patch(':id/activate')
  async setActivePlan(
    @Param('id') id: string,
    @Request() req: Express.Request & { user: JwtUser }
  ): Promise<UserPlanResponseDto> {
    this.logger.log(`User ${req.user.userId} setting user plan ${id} as active`);
    return await this.userPlanService.setActivePlan(id, req.user.userId);
  }

  @Get(':id/download')
  async downloadPlan(
    @Param('id') id: string,
    @Request() req: Express.Request & { user: JwtUser },
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    this.logger.log(`User ${req.user.userId} downloading user plan ${id}`);
    
    const fileBuffer = await this.userPlanService.downloadPlan(id, req.user.userId);
    const userPlan = await this.userPlanService.findOne(id, req.user.userId);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${userPlan.fileName}"`,
      'Content-Length': fileBuffer.length.toString(),
    });
    
    return new StreamableFile(fileBuffer);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Request() req: Express.Request & { user: JwtUser }
  ): Promise<void> {
    this.logger.log(`User ${req.user.userId} deleting user plan ${id}`);
    await this.userPlanService.remove(id, req.user.userId);
  }
}
