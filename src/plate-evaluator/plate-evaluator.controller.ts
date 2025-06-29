import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  UsePipes, 
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { PlateEvaluatorService } from './plate-evaluator.service';
import { EvaluatePlateDto } from './dto/evaluate-plate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
  async evaluatePlate(@Body() evaluatePlateDto: EvaluatePlateDto): Promise<PlateEvaluation> {
    this.logger.log(`Evaluating plate with ${evaluatePlateDto.ingredients.length} ingredients`);
    
    const evaluation = await this.plateEvaluatorService.evaluatePlate(evaluatePlateDto);
    
    return evaluation;
  }
} 