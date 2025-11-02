import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { RecipeRecommendationLog } from './recipe-recommendation-log.entity';
import { User } from '../user/user.entity';
import { PointsService } from '../points/points.service';
import { GenerateRecipeDto } from './dto/generate-recipe.dto';
import { GenerateFromEvaluationDto } from './dto/generate-from-evaluation.dto';
import { ActivityType } from '../points/point-transactions.entity';
import { CustomInstructionsService } from '../custom-instructions/custom-instructions.service';

interface Recipe {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  nutritionalBenefits: string[];
}

interface RecipeRecommendationResponse {
  recipes: Recipe[];
  pointsSpent: number;
  remainingPoints: number;
}

@Injectable()
export class RecipeRecommendationsService {
  private readonly logger = new Logger(RecipeRecommendationsService.name);
  private readonly RECIPE_COST = 5; // Points cost for recipe recommendations

  constructor(
    private readonly configService: ConfigService,
    @Inject('RECIPE_RECOMMENDATION_LOG_REPOSITORY')
    private recipeRecommendationLogRepository: Repository<RecipeRecommendationLog>,
    private pointsService: PointsService,
    private customInstructionsService: CustomInstructionsService,
  ) {}

  /**
   * Strips markdown code blocks from OpenAI response
   */
  private stripMarkdownCodeBlocks(text: string): string {
    // Remove ```json ... ``` or ``` ... ``` blocks
    return text
      .replace(/^```(?:json)?\s*\n/i, '')
      .replace(/\n```\s*$/i, '')
      .trim();
  }

  async generateRecipeRecommendations(
    generateRecipeDto: GenerateRecipeDto,
    userId: number,
  ): Promise<RecipeRecommendationResponse> {
    const {
      plateEvaluationId,
      ingredients,
      evaluationScore,
      evaluationIssues,
    } = generateRecipeDto;

    // Check if user has enough points
    const pointsStatus = await this.pointsService.getPointsStatus(userId);
    if (pointsStatus.totalPoints < this.RECIPE_COST) {
      throw new Error(
        `Insufficient points. You have ${pointsStatus.totalPoints} points, but need ${this.RECIPE_COST} points for recipe recommendations.`,
      );
    }

    // Create initial log entry
    const logEntry = this.recipeRecommendationLogRepository.create({
      user: { id: userId } as User,
      plateEvaluationId,
      ingredients,
      evaluationScore,
      evaluationIssues,
      pointsSpent: this.RECIPE_COST,
      isSuccess: false,
    });

    let requestPayload: any = null;

    try {
      // Get custom instructions for the user
      const customInstructions =
        await this.customInstructionsService.getActiveInstructionsForUser(
          userId,
        );
      this.logger.log(
        `Found ${customInstructions.length} custom instructions for user ${userId}: ${customInstructions.join(', ')}`,
      );
      const prompt = this.buildRecipePrompt(
        ingredients,
        evaluationScore,
        evaluationIssues,
        customInstructions,
      );

      // Instantiate OpenAI client
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (!apiKey) {
        this.logger.warn('OPENAI_API_KEY not found in environment variables');
        throw new Error('OPENAI_API_KEY not found in environment variables');
      }
      const openai = new OpenAI({ apiKey });

      requestPayload = {
        model: 'gpt-3.5-turbo' as const,
        messages: [
          {
            role: 'system' as const,
            content: `Sos una chef argentina experta en nutrición que crea recetas saludables, deliciosas y fáciles de seguir. Tus recetas deben ser prácticas, usar ingredientes accesibles y mantener la cultura gastronómica argentina.`,
          },
          {
            role: 'user' as const,
            content: prompt,
          },
        ],
        max_tokens: 1200,
        temperature: 0.8,
      };

      const completion = await openai.chat.completions.create(requestPayload);

      const recipeResponse = completion.choices[0]?.message?.content;

      if (!recipeResponse) {
        throw new Error('No recipe recommendations received from OpenAI');
      }

      // Parse JSON response
      try {
        const cleanedResponse = this.stripMarkdownCodeBlocks(recipeResponse);
        const parsedRecipes = JSON.parse(cleanedResponse);

        // Validate recipe structure
        if (!parsedRecipes.recipes || !Array.isArray(parsedRecipes.recipes)) {
          throw new Error('Invalid recipe response format');
        }

        // Store successful request data
        logEntry.recipes = parsedRecipes.recipes;
        logEntry.isSuccess = true;

        // Store token usage for analytics
        if (completion.usage) {
          logEntry.promptTokens = completion.usage.prompt_tokens;
          logEntry.completionTokens = completion.usage.completion_tokens;
          logEntry.totalTokens = completion.usage.total_tokens;
        }

        // Save log entry
        await this.recipeRecommendationLogRepository.save(logEntry);

        // Deduct points for recipe recommendations
        try {
          await this.pointsService.spendPoints(
            userId,
            this.RECIPE_COST,
            ActivityType.RECIPE_RECOMMENDATION,
            'Recipe recommendations generated',
            logEntry.id,
          );

          this.logger.log(
            `Deducted ${this.RECIPE_COST} points from user ${userId} for recipe recommendations`,
          );
        } catch (error) {
          this.logger.error(
            'Failed to deduct points for recipe recommendations:',
            error,
          );
          throw new Error('Failed to process points transaction');
        }

        // Get updated points status
        const updatedPointsStatus =
          await this.pointsService.getPointsStatus(userId);

        this.logger.log(
          `Recipe recommendations generated for user ${userId} with ${ingredients.length} ingredients`,
        );

        return {
          recipes: parsedRecipes.recipes,
          pointsSpent: this.RECIPE_COST,
          remainingPoints: updatedPointsStatus.totalPoints,
        };
      } catch (parseError) {
        this.logger.error('Error parsing recipe JSON response:', parseError);
        this.logger.error('Raw OpenAI response:', recipeResponse);

        // Store failed request data for debugging
        if (requestPayload) {
          logEntry.openaiRequest = requestPayload;
        }
        if (typeof completion !== 'undefined') {
          logEntry.openaiResponse = completion as any;
        }
        logEntry.errorMessage = `JSON parsing error: ${parseError.message}`;
        await this.recipeRecommendationLogRepository.save(logEntry);
        throw new Error('Invalid JSON response from OpenAI');
      }
    } catch (error) {
      this.logger.error('Error generating recipe recommendations:', error);

      // Store failed request data for debugging
      if (requestPayload) {
        logEntry.openaiRequest = requestPayload;
      }
      logEntry.errorMessage = error.message;
      await this.recipeRecommendationLogRepository.save(logEntry);
      throw new Error(
        `Error generating recipe recommendations: ${error.message}`,
      );
    }
  }

  private buildRecipePrompt(
    ingredients: string[],
    evaluationScore: number,
    evaluationIssues: string[],
    customInstructions: string[] = [],
  ): string {
    const ingredientNames = ingredients.join(', ');
    const issuesText =
      evaluationIssues.length > 0 ? evaluationIssues.join(', ') : 'ninguno';

    // Build custom instructions section
    let customInstructionsText = '';
    if (customInstructions.length > 0) {
      customInstructionsText = `

**INSTRUCCIONES PERSONALIZADAS DEL NUTRICIONISTA:**
${customInstructions.map((instruction) => `- ${instruction}`).join('\n')}

IMPORTANTE: Estas instrucciones son específicas para este paciente y DEBEN ser seguidas estrictamente al crear las recetas. NO incluyas ingredientes que vayan contra estas instrucciones. Si las instrucciones mencionan evitar ciertos ingredientes, NO los uses en ninguna receta.`;
    }

    return `Necesito que me ayudes a crear recetas saludables basadas en un plato que acabo de evaluar.

**Ingredientes del plato original:** ${ingredientNames}
**Puntuación de la evaluación:** ${evaluationScore}/10
**Aspectos a mejorar:** ${issuesText}${customInstructionsText}

**Requisitos para las recetas:**
- Crea 3-4 recetas diferentes que mejoren los aspectos nutricionales del plato original
- Usa ingredientes similares o complementarios a los del plato original
- Las recetas deben ser fáciles de preparar (tiempo máximo 45 minutos)
- Incluye opciones para diferentes niveles de dificultad
- Mantén la cultura gastronómica argentina
- Enfócate en mejorar los aspectos nutricionales identificados en la evaluación

**Formato de respuesta (JSON únicamente):**
{
  "recipes": [
    {
      "name": "Nombre de la receta",
      "description": "Breve descripción de la receta y sus beneficios",
      "ingredients": ["ingrediente 1", "ingrediente 2", ...],
      "instructions": ["Paso 1", "Paso 2", ...],
      "cookingTime": "XX minutos",
      "difficulty": "easy|medium|hard",
      "nutritionalBenefits": ["Beneficio 1", "Beneficio 2", ...]
    }
  ]
}

Responde ÚNICAMENTE en formato JSON, sin explicaciones adicionales.`;
  }

  async generateFromEvaluation(
    generateFromEvaluationDto: GenerateFromEvaluationDto,
    userId: number,
  ): Promise<RecipeRecommendationResponse> {
    const { ingredients, positives, improvements } = generateFromEvaluationDto;

    // Check if user has enough points
    const pointsStatus = await this.pointsService.getPointsStatus(userId);
    if (pointsStatus.totalPoints < this.RECIPE_COST) {
      throw new Error(
        `Insufficient points. You have ${pointsStatus.totalPoints} points, but need ${this.RECIPE_COST} points for recipe recommendations.`,
      );
    }

    // Create initial log entry
    const logEntry = this.recipeRecommendationLogRepository.create({
      user: { id: userId } as User,
      ingredients,
      evaluationScore: null, // Not applicable for this endpoint
      evaluationIssues: improvements,
      pointsSpent: this.RECIPE_COST,
      isSuccess: false,
    });

    let requestPayload: any = null;

    try {
      // Get custom instructions for the user
      const customInstructions =
        await this.customInstructionsService.getActiveInstructionsForUser(
          userId,
        );
      this.logger.log(
        `Found ${customInstructions.length} custom instructions for user ${userId}: ${customInstructions.join(', ')}`,
      );
      const prompt = this.buildRecipePromptFromEvaluation(
        ingredients,
        positives,
        improvements,
        customInstructions,
      );

      // Instantiate OpenAI client
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (!apiKey) {
        this.logger.warn('OPENAI_API_KEY not found in environment variables');
        throw new Error('OPENAI_API_KEY not found in environment variables');
      }
      const openai = new OpenAI({ apiKey });

      requestPayload = {
        model: 'gpt-3.5-turbo' as const,
        messages: [
          {
            role: 'system' as const,
            content: `Sos una chef argentina experta en nutrición que crea recetas saludables, deliciosas y fáciles de seguir. Tus recetas deben ser prácticas, usar ingredientes accesibles y mantener la cultura gastronómica argentina.`,
          },
          {
            role: 'user' as const,
            content: prompt,
          },
        ],
        max_tokens: 1200,
        temperature: 0.8,
      };

      const completion = await openai.chat.completions.create(requestPayload);

      const recipeResponse = completion.choices[0]?.message?.content;

      if (!recipeResponse) {
        throw new Error('No recipe recommendations received from OpenAI');
      }

      // Parse JSON response
      try {
        const cleanedResponse = this.stripMarkdownCodeBlocks(recipeResponse);
        const parsedRecipes = JSON.parse(cleanedResponse);

        // Validate recipe structure
        if (!parsedRecipes.recipes || !Array.isArray(parsedRecipes.recipes)) {
          throw new Error('Invalid recipe response format');
        }

        // Store successful request data
        logEntry.recipes = parsedRecipes.recipes;
        logEntry.isSuccess = true;

        // Store token usage for analytics
        if (completion.usage) {
          logEntry.promptTokens = completion.usage.prompt_tokens;
          logEntry.completionTokens = completion.usage.completion_tokens;
          logEntry.totalTokens = completion.usage.total_tokens;
        }

        // Save log entry
        await this.recipeRecommendationLogRepository.save(logEntry);

        // Deduct points for recipe recommendations
        try {
          await this.pointsService.spendPoints(
            userId,
            this.RECIPE_COST,
            ActivityType.RECIPE_RECOMMENDATION,
            'Recipe recommendations generated from evaluation',
            logEntry.id,
          );

          this.logger.log(
            `Deducted ${this.RECIPE_COST} points from user ${userId} for recipe recommendations`,
          );
        } catch (error) {
          this.logger.error(
            'Failed to deduct points for recipe recommendations:',
            error,
          );
          throw new Error('Failed to process points transaction');
        }

        // Get updated points status
        const updatedPointsStatus =
          await this.pointsService.getPointsStatus(userId);

        this.logger.log(
          `Recipe recommendations generated for user ${userId} with ${ingredients.length} ingredients`,
        );

        return {
          recipes: parsedRecipes.recipes,
          pointsSpent: this.RECIPE_COST,
          remainingPoints: updatedPointsStatus.totalPoints,
        };
      } catch (parseError) {
        this.logger.error('Error parsing recipe JSON response:', parseError);
        this.logger.error('Raw OpenAI response:', recipeResponse);

        // Store failed request data for debugging
        if (requestPayload) {
          logEntry.openaiRequest = requestPayload;
        }
        if (typeof completion !== 'undefined') {
          logEntry.openaiResponse = completion as any;
        }
        logEntry.errorMessage = `JSON parsing error: ${parseError.message}`;
        await this.recipeRecommendationLogRepository.save(logEntry);
        throw new Error('Invalid JSON response from OpenAI');
      }
    } catch (error) {
      this.logger.error('Error generating recipe recommendations:', error);

      // Store failed request data for debugging
      if (requestPayload) {
        logEntry.openaiRequest = requestPayload;
      }
      logEntry.errorMessage = error.message;
      await this.recipeRecommendationLogRepository.save(logEntry);
      throw new Error(
        `Error generating recipe recommendations: ${error.message}`,
      );
    }
  }

  private buildRecipePromptFromEvaluation(
    ingredients: string[],
    positives: string[],
    improvements: string[],
    customInstructions: string[] = [],
  ): string {
    const ingredientNames = ingredients.join(', ');
    const positivesText =
      positives.length > 0 ? positives.join(', ') : 'ninguno identificado';
    const improvementsText =
      improvements.length > 0 ? improvements.join(', ') : 'ninguno';

    // Build custom instructions section
    let customInstructionsText = '';
    if (customInstructions.length > 0) {
      customInstructionsText = `

**INSTRUCCIONES PERSONALIZADAS DEL NUTRICIONISTA:**
${customInstructions.map((instruction) => `- ${instruction}`).join('\n')}

IMPORTANTE: Estas instrucciones son específicas para este paciente y DEBEN ser seguidas estrictamente al crear las recetas. NO incluyas ingredientes que vayan contra estas instrucciones. Si las instrucciones mencionan evitar ciertos ingredientes, NO los uses en ninguna receta.`;
    }

    return `Necesito que me ayudes a crear recetas saludables personalizadas basadas en un plato que acabo de evaluar.

**Ingredientes del plato:** ${ingredientNames}
**Aspectos positivos:** ${positivesText}
**Aspectos a mejorar:** ${improvementsText}${customInstructionsText}

**Requisitos para las recetas:**
- Crea entre 1 y 3 recetas diferentes que aprovechen los aspectos positivos y mejoren los aspectos identificados
- Las recetas deben ser variadas (diferentes técnicas de cocción, estilos, etc.)
- Usa ingredientes similares o complementarios a los del plato original
- Las recetas deben ser fáciles de preparar (tiempo máximo 45 minutos)
- Incluye opciones para diferentes niveles de dificultad
- Mantén la cultura gastronómica argentina
- Enfócate en potenciar los aspectos positivos y mejorar los aspectos nutricionales que necesitan atención

**Formato de respuesta (JSON únicamente):**
{
  "recipes": [
    {
      "name": "Nombre de la receta",
      "description": "Breve descripción de la receta y sus beneficios",
      "ingredients": ["ingrediente 1", "ingrediente 2", ...],
      "instructions": ["Paso 1", "Paso 2", ...],
      "cookingTime": "XX minutos",
      "difficulty": "easy|medium|hard",
      "nutritionalBenefits": ["Beneficio 1", "Beneficio 2", ...]
    }
  ]
}

Responde ÚNICAMENTE en formato JSON, sin explicaciones adicionales.`;
  }

  async getRecipeRecommendationHistory(userId: number): Promise<any[]> {
    this.logger.log(
      `Fetching recipe recommendation history for user ${userId}`,
    );

    const logs = await this.recipeRecommendationLogRepository.find({
      where: { user: { id: userId }, isSuccess: true },
      order: { createdAt: 'DESC' },
      take: 20, // Limit to last 20 recommendations
      select: [
        'id',
        'plateEvaluationId',
        'ingredients',
        'evaluationScore',
        'recipes',
        'pointsSpent',
        'createdAt',
      ],
    });

    return logs.map((log) => ({
      id: log.id,
      plateEvaluationId: log.plateEvaluationId,
      ingredients: log.ingredients,
      evaluationScore: log.evaluationScore,
      recipes: log.recipes,
      pointsSpent: log.pointsSpent,
      createdAt: log.createdAt,
    }));
  }

  async getPatientRecipeRecommendations(
    patientId: number,
    includeHidden: boolean = false,
  ): Promise<any[]> {
    this.logger.log(
      `Fetching recipe recommendations for patient ${patientId}, includeHidden: ${includeHidden}`,
    );

    const whereCondition: any = {
      user: { id: patientId },
      isSuccess: true,
    };

    if (!includeHidden) {
      whereCondition.isHiddenFromNutritionist = false;
    }

    const logs = await this.recipeRecommendationLogRepository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      select: [
        'id',
        'plateEvaluationId',
        'ingredients',
        'evaluationScore',
        'evaluationIssues',
        'recipes',
        'pointsSpent',
        'isHiddenFromNutritionist',
        'createdAt',
      ],
    });

    return logs.map((log) => ({
      id: log.id,
      plateEvaluationId: log.plateEvaluationId,
      ingredients: log.ingredients,
      evaluationScore: log.evaluationScore,
      evaluationIssues: log.evaluationIssues,
      recipes: log.recipes,
      pointsSpent: log.pointsSpent,
      isHiddenFromNutritionist: log.isHiddenFromNutritionist,
      createdAt: log.createdAt,
    }));
  }

  async toggleNutritionistHideRecipe(
    logId: number,
    nutritionistId: number,
  ): Promise<{ success: boolean; isHidden: boolean }> {
    this.logger.log(
      `Toggling nutritionist hide status for recipe recommendation ${logId} by nutritionist ${nutritionistId}`,
    );

    const logEntry = await this.recipeRecommendationLogRepository.findOne({
      where: { id: logId },
    });

    if (!logEntry) {
      throw new Error('Recipe recommendation not found');
    }

    logEntry.isHiddenFromNutritionist = !logEntry.isHiddenFromNutritionist;
    await this.recipeRecommendationLogRepository.save(logEntry);

    return {
      success: true,
      isHidden: logEntry.isHiddenFromNutritionist,
    };
  }
}
