import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Request, 
  Get,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecipeRecommendationsService } from './recipe-recommendations.service';
import { GenerateRecipeDto } from './dto/generate-recipe.dto';
import { RecipeRecommendationResponseDto } from './dto/recipe-recommendation.dto';

@Controller('recipe-recommendations')
@UseGuards(JwtAuthGuard)
export class RecipeRecommendationsController {
  private readonly logger = new Logger(RecipeRecommendationsController.name);

  constructor(
    private readonly recipeRecommendationsService: RecipeRecommendationsService,
  ) {}

  @Post('generate')
  async generateRecipeRecommendations(
    @Body() generateRecipeDto: GenerateRecipeDto,
    @Request() req: any
  ): Promise<RecipeRecommendationResponseDto> {
    try {
      this.logger.log(`User ${req.user.id} requesting recipe recommendations for plate evaluation ${generateRecipeDto.plateEvaluationId}`);
      
      const result = await this.recipeRecommendationsService.generateRecipeRecommendations(
        generateRecipeDto,
        req.user.id
      );

      return result;
    } catch (error) {
      this.logger.error(`Error generating recipe recommendations for user ${req.user.id}:`, error);
      
      if (error.message.includes('Insufficient points')) {
        throw new HttpException(error.message, HttpStatus.PAYMENT_REQUIRED);
      }
      
      throw new HttpException(
        error.message || 'Error generating recipe recommendations',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('history')
  async getRecipeRecommendationHistory(@Request() req: any): Promise<any[]> {
    try {
      this.logger.log(`User ${req.user.id} requesting recipe recommendation history`);
      
      return await this.recipeRecommendationsService.getRecipeRecommendationHistory(req.user.id);
    } catch (error) {
      this.logger.error(`Error fetching recipe recommendation history for user ${req.user.id}:`, error);
      
      throw new HttpException(
        'Error fetching recipe recommendation history',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
