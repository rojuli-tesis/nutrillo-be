import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  UsePipes, 
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Logger,
  Request,
  Get,
  Param,
  Put
} from '@nestjs/common';
import { PlateEvaluatorService } from './plate-evaluator.service';
import { EvaluatePlateDto } from './dto/evaluate-plate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';

interface PlateEvaluation {
  score: number;
  positives: string[];
  issues: string[];
  suggestions: string;
}

@Controller('plate-evaluator')
@UseGuards(JwtAuthGuard)
export class PlateEvaluatorController {
  private readonly logger = new Logger(PlateEvaluatorController.name);

  constructor(private readonly plateEvaluatorService: PlateEvaluatorService) {}

  @Post('evaluate')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async evaluatePlate(
    @Body() evaluatePlateDto: EvaluatePlateDto,
    @Request() req: Express.Request & { user: JwtUser }
  ): Promise<PlateEvaluation> {
    this.logger.log(`Evaluating plate with ${evaluatePlateDto.ingredients.length} ingredients for user ${req.user.userId}`);
    
    const evaluation = await this.plateEvaluatorService.evaluatePlate(evaluatePlateDto, req.user.userId);
    
    return evaluation;
  }

  @Get('history')
  @HttpCode(HttpStatus.OK)
  async getEvaluationHistory(
    @Request() req: Express.Request & { user: JwtUser }
  ) {
    this.logger.log(`Getting evaluation history for user ${req.user.userId}`);
    return await this.plateEvaluatorService.getEvaluationHistory(req.user.userId);
  }

  @Get('favorites')
  @HttpCode(HttpStatus.OK)
  async getFavoriteEvaluations(
    @Request() req: Express.Request & { user: JwtUser }
  ) {
    this.logger.log(`Getting favorite evaluations for user ${req.user.userId}`);
    return await this.plateEvaluatorService.getFavoriteEvaluations(req.user.userId);
  }

  @Put(':id/toggle-favorite')
  @HttpCode(HttpStatus.OK)
  async toggleFavorite(
    @Param('id') id: number,
    @Request() req: Express.Request & { user: JwtUser }
  ) {
    this.logger.log(`Toggling favorite status for evaluation ${id} by user ${req.user.userId}`);
    return await this.plateEvaluatorService.toggleFavorite(id, req.user.userId);
  }
} 