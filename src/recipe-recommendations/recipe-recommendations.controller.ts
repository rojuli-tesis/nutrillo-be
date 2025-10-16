import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Request, 
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Put,
  Query
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecipeRecommendationsService } from './recipe-recommendations.service';
import { GenerateRecipeDto } from './dto/generate-recipe.dto';
import { GenerateFromEvaluationDto } from './dto/generate-from-evaluation.dto';
import { RecipeRecommendationResponseDto } from './dto/recipe-recommendation.dto';

@Controller('recipe-recommendations')
@UseGuards(JwtAuthGuard)
export class RecipeRecommendationsController {
  private readonly logger = new Logger(RecipeRecommendationsController.name);

  constructor(
    private readonly recipeRecommendationsService: RecipeRecommendationsService,
  ) {}

  @Post('generate')
  async generateFromEvaluation(
    @Body() generateFromEvaluationDto: GenerateFromEvaluationDto,
    @Request() req: any
  ): Promise<RecipeRecommendationResponseDto> {
    try {
      this.logger.log(`User ${req.user.userId} requesting recipe recommendations from evaluation`);
      
      const result = await this.recipeRecommendationsService.generateFromEvaluation(
        generateFromEvaluationDto,
        req.user.userId
      );

      return result;
    } catch (error) {
      this.logger.error(`Error generating recipe recommendations for user ${req.user.userId}:`, error);
      
      if (error.message.includes('Insufficient points')) {
        throw new HttpException(error.message, HttpStatus.PAYMENT_REQUIRED);
      }
      
      throw new HttpException(
        error.message || 'Error generating recipe recommendations',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('generate-from-plate')
  async generateRecipeRecommendations(
    @Body() generateRecipeDto: GenerateRecipeDto,
    @Request() req: any
  ): Promise<RecipeRecommendationResponseDto> {
    try {
      this.logger.log(`User ${req.user.userId} requesting recipe recommendations for plate evaluation ${generateRecipeDto.plateEvaluationId}`);
      
      const result = await this.recipeRecommendationsService.generateRecipeRecommendations(
        generateRecipeDto,
        req.user.userId
      );

      return result;
    } catch (error) {
      this.logger.error(`Error generating recipe recommendations for user ${req.user.userId}:`, error);
      
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
      this.logger.log(`User ${req.user.userId} requesting recipe recommendation history`);
      
      return await this.recipeRecommendationsService.getRecipeRecommendationHistory(req.user.userId);
    } catch (error) {
      this.logger.error(`Error fetching recipe recommendation history for user ${req.user.userId}:`, error);
      
      throw new HttpException(
        'Error fetching recipe recommendation history',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('patient/:patientId')
  async getPatientRecipeRecommendations(
    @Param('patientId') patientId: number,
    @Query('includeHidden') includeHidden: string,
    @Request() req: any
  ): Promise<any[]> {
    try {
      this.logger.log(`Nutritionist ${req.user.userId} requesting recipe recommendations for patient ${patientId}`);
      
      const includeHiddenBool = includeHidden === 'true';
      return await this.recipeRecommendationsService.getPatientRecipeRecommendations(patientId, includeHiddenBool);
    } catch (error) {
      this.logger.error(`Error fetching recipe recommendations for patient ${patientId}:`, error);
      
      throw new HttpException(
        'Error fetching recipe recommendations for patient',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id/toggle-nutritionist-hide')
  async toggleNutritionistHideRecipe(
    @Param('id') id: number,
    @Request() req: any
  ): Promise<{ success: boolean; isHidden: boolean }> {
    try {
      this.logger.log(`Nutritionist ${req.user.userId} toggling hide status for recipe recommendation ${id}`);
      
      return await this.recipeRecommendationsService.toggleNutritionistHideRecipe(id, req.user.userId);
    } catch (error) {
      this.logger.error(`Error toggling hide status for recipe recommendation ${id}:`, error);
      
      throw new HttpException(
        'Error toggling hide status for recipe recommendation',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
