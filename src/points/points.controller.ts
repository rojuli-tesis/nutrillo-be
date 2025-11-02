import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PointsService } from './points.service';
import { PointsStatusDto, PointsHistoryDto } from './dto/points-status.dto';
import {
  ActivityHistoryDto,
  CalendarMonthDto,
} from './dto/activity-history.dto';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';

@Controller('points')
@UseGuards(JwtAuthGuard)
export class PointsController {
  private readonly logger = new Logger(PointsController.name);

  constructor(private readonly pointsService: PointsService) {}

  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getPointsStatus(
    @Request() req: Express.Request & { user: JwtUser },
  ): Promise<PointsStatusDto> {
    this.logger.log(`Getting points status for user ${req.user.userId}`);
    return await this.pointsService.getPointsStatus(req.user.userId);
  }

  @Get('history')
  @HttpCode(HttpStatus.OK)
  async getPointsHistory(
    @Request() req: Express.Request & { user: JwtUser },
    @Query('limit') limit?: string,
  ): Promise<PointsHistoryDto> {
    const limitNumber = limit ? parseInt(limit, 10) : 50;
    this.logger.log(
      `Getting points history for user ${req.user.userId} with limit ${limitNumber}`,
    );
    return await this.pointsService.getPointsHistory(
      req.user.userId,
      limitNumber,
    );
  }

  @Get('calendar/:year/:month')
  @HttpCode(HttpStatus.OK)
  async getCalendarMonth(
    @Request() req: Express.Request & { user: JwtUser },
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ): Promise<CalendarMonthDto> {
    this.logger.log(
      `Getting calendar data for user ${req.user.userId} for ${year}-${month}`,
    );
    return await this.pointsService.getCalendarMonth(
      req.user.userId,
      year,
      month,
    );
  }

  @Get('activity-history')
  @HttpCode(HttpStatus.OK)
  async getActivityHistory(
    @Request() req: Express.Request & { user: JwtUser },
    @Query('limit') limit?: string,
  ): Promise<ActivityHistoryDto> {
    const limitNumber = limit ? parseInt(limit, 10) : 100;
    this.logger.log(
      `Getting activity history for user ${req.user.userId} with limit ${limitNumber}`,
    );
    return await this.pointsService.getActivityHistory(
      req.user.userId,
      limitNumber,
    );
  }
}
