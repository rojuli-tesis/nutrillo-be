import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { EvaluatePlateDto } from './dto/evaluate-plate.dto';
import { ToggleFavoriteResponseDto } from './dto/toggle-favorite.dto';
import { PlateEvaluationLog } from './plate-evaluation-log.entity';
import { User } from '../user/user.entity';
import { PointsService } from '../points/points.service';
import { CustomInstructionsService } from '../custom-instructions/custom-instructions.service';

interface PlateEvaluation {
  score: number;
  positives: string[];
  issues: string[];
  suggestions: string;
}

@Injectable()
export class PlateEvaluatorService {
  private readonly logger = new Logger(PlateEvaluatorService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject('PLATE_EVALUATION_LOG_REPOSITORY')
    private plateEvaluationLogRepository: Repository<PlateEvaluationLog>,
    private pointsService: PointsService,
    private customInstructionsService: CustomInstructionsService,
  ) {}

  async evaluatePlate(
    evaluatePlateDto: EvaluatePlateDto,
    userId: number,
  ): Promise<PlateEvaluation> {
    const { ingredients } = evaluatePlateDto;
    this.logger.log(`Starting plate evaluation for user ID: ${userId}`);

    // Create initial log entry
    const logEntry = this.plateEvaluationLogRepository.create({
      user: { id: userId } as User,
      ingredients: ingredients.map((ing) => ({
        name: ing.name,
        type: ing.type,
        subtype: ing.subtype,
      })),
      isSuccess: false,
    });

    let requestPayload: any = null;

    try {
      if (ingredients.length < 3) {
        throw new Error('At least 3 ingredients are required for evaluation');
      }

      // Get custom instructions for the user
      const customInstructions =
        await this.customInstructionsService.getActiveInstructionsForUser(
          userId,
        );
      this.logger.log(
        `Found ${customInstructions.length} custom instructions for user ${userId}: ${customInstructions.join(', ')}`,
      );
      const prompt = this.buildEvaluationPrompt(
        ingredients,
        customInstructions,
      );
      this.logger.log(`Generated prompt with custom instructions: ${prompt}`);

      // Instantiate OpenAI client only when needed
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
            content: `Sos una nutricionista argentina que analiza platos de comida de forma clara, práctica y educativa.`,
          },
          {
            role: 'user' as const,
            content: prompt,
          },
        ],
        max_tokens: 800,
        temperature: 0.7,
      };

      const completion = await openai.chat.completions.create(requestPayload);

      const evaluation = completion.choices[0]?.message?.content;

      if (!evaluation) {
        throw new Error('No evaluation received from OpenAI');
      }

      // Parse JSON response
      try {
        const parsedEvaluation = JSON.parse(evaluation);

        // For successful requests, store only essential data (not full payload/response)
        logEntry.score = parsedEvaluation.score;
        logEntry.positives = parsedEvaluation.positives;
        logEntry.issues = parsedEvaluation.issues;
        logEntry.suggestions = parsedEvaluation.suggestions;
        logEntry.isSuccess = true;

        // Store token usage for analytics (without storing full response)
        if (completion.usage) {
          logEntry.promptTokens = completion.usage.prompt_tokens;
          logEntry.completionTokens = completion.usage.completion_tokens;
          logEntry.totalTokens = completion.usage.total_tokens;
        }

        // Save log entry
        const savedLogEntry =
          await this.plateEvaluationLogRepository.save(logEntry);

        // Award points for plate evaluation
        try {
          const pointsResult =
            await this.pointsService.awardPlateEvaluationPoints(
              userId,
              parsedEvaluation.score,
              savedLogEntry.id,
            );

          // Update the log entry with points information
          await this.plateEvaluationLogRepository.update(savedLogEntry.id, {
            pointsEarned: pointsResult.pointsEarned,
            streakMultiplier: pointsResult.multiplier,
          });

          this.logger.log(
            `Awarded ${pointsResult.pointsEarned} points to user ${userId} for plate evaluation`,
          );
        } catch (error) {
          this.logger.error(
            'Failed to award points for plate evaluation:',
            error,
          );
          // Don't fail the evaluation if points awarding fails
        }

        this.logger.log(
          `Plate evaluation completed for ${ingredients.length} ingredients for user ${userId}`,
        );
        return {
          ...parsedEvaluation,
          evaluationId: logEntry.id,
        };
      } catch (parseError) {
        this.logger.error('Error parsing JSON response:', parseError);

        // For failed requests, store full request/response for debugging
        if (requestPayload) {
          logEntry.openaiRequest = requestPayload;
        }
        if (typeof completion !== 'undefined') {
          logEntry.openaiResponse = completion as any;
        }
        logEntry.errorMessage = `JSON parsing error: ${parseError.message}`;
        await this.plateEvaluationLogRepository.save(logEntry);
        throw new Error('Invalid JSON response from OpenAI');
      }
    } catch (error) {
      this.logger.error('Error evaluating plate:', error);

      // For failed requests, store full request for debugging
      if (requestPayload) {
        logEntry.openaiRequest = requestPayload;
      }
      logEntry.errorMessage = error.message;
      await this.plateEvaluationLogRepository.save(logEntry);
      throw new Error(`Error evaluating plate: ${error.message}`);
    }
  }

  private buildEvaluationPrompt(
    ingredients: any[],
    customInstructions: string[] = [],
  ): string {
    const ingredientNames = ingredients.map((ing) => ing.name).join(', ');

    // Build custom instructions section
    let customInstructionsText = '';
    if (customInstructions.length > 0) {
      customInstructionsText = `

INSTRUCCIONES PERSONALIZADAS DEL NUTRICIONISTA:
${customInstructions.map((instruction) => `- ${instruction}`).join('\n')}

IMPORTANTE: Estas instrucciones son específicas para este paciente y DEBEN ser consideradas al evaluar el plato. Si algún ingrediente o combinación va contra estas instrucciones, debes:
1. Reducir significativamente la puntuación
2. Mencionar específicamente en "issues" por qué ese ingrediente/combinación es problemático según las instrucciones
3. En "suggestions", explicar qué alternativas recomiendas basándote en las instrucciones personalizadas`;
    }

    return `Estás ayudando a evaluar un plato de comida. Te paso una lista de ingredientes. Respondé únicamente en formato JSON, sin explicaciones, sin introducción ni cierre.

Ingredientes del plato: ${ingredientNames}${customInstructionsText}

Evaluá lo siguiente:

- "score": un número del 1 al 10 que refleje qué tan saludable y equilibrado es el plato. Si hay ingredientes que van contra las instrucciones personalizadas, reduce la puntuación significativamente.
- "positives": array con los aspectos positivos detectados (presencia de vegetales, proteínas magras, pocas grasas, buena variedad, etc.).
- "issues": array con los aspectos a mejorar. Si algún ingrediente va contra las instrucciones personalizadas, menciona específicamente por qué es problemático según esas instrucciones.
- "suggestions": un solo párrafo, breve y claro, con sugerencias concretas para mejorar el plato. Si hay problemas relacionados con las instrucciones personalizadas, explica qué alternativas recomiendas.

Devolvé SOLO el JSON. No agregues comentarios ni texto fuera de la estructura.`;
  }

  async getEvaluationHistory(userId: number): Promise<any[]> {
    this.logger.log(`Fetching evaluation history for user ${userId}`);

    const logs = await this.plateEvaluationLogRepository.find({
      where: { user: { id: userId }, isSuccess: true },
      order: { createdAt: 'DESC' },
      take: 50, // Limit to last 50 evaluations
      select: [
        'id',
        'ingredients',
        'score',
        'positives',
        'issues',
        'suggestions',
        'isVisibleToUser',
        'createdAt',
      ],
    });

    // Return in the same format as before for frontend compatibility
    return logs.map((log) => ({
      id: log.id,
      ingredients: log.ingredients,
      evaluation: {
        score: log.score,
        positives: log.positives,
        issues: log.issues,
        suggestions: log.suggestions,
      },
      isVisibleToUser: log.isVisibleToUser,
      createdAt: log.createdAt,
    }));
  }

  async getFavoriteEvaluations(userId: number): Promise<any[]> {
    this.logger.log(`Fetching favorite evaluations for user ${userId}`);

    const logs = await this.plateEvaluationLogRepository.find({
      where: {
        user: { id: userId },
        isSuccess: true,
        isVisibleToUser: true,
      },
      order: { updatedAt: 'DESC' },
      select: [
        'id',
        'ingredients',
        'score',
        'positives',
        'issues',
        'suggestions',
        'userNotes',
        'nutritionistNotes',
        'createdAt',
        'updatedAt',
      ],
    });

    // Return in the same format as before for frontend compatibility
    return logs.map((log) => ({
      id: log.id,
      ingredients: log.ingredients,
      evaluation: {
        score: log.score,
        positives: log.positives,
        issues: log.issues,
        suggestions: log.suggestions,
      },
      userNotes: log.userNotes,
      nutritionistNotes: log.nutritionistNotes,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    }));
  }

  async toggleFavorite(
    logId: number,
    userId: number,
  ): Promise<ToggleFavoriteResponseDto> {
    this.logger.log(
      `Toggling favorite status for evaluation ${logId} by user ${userId}`,
    );

    const logEntry = await this.plateEvaluationLogRepository.findOne({
      where: { id: logId, user: { id: userId } },
    });

    if (!logEntry) {
      throw new Error('Evaluation not found or not owned by user');
    }

    logEntry.isVisibleToUser = !logEntry.isVisibleToUser;
    await this.plateEvaluationLogRepository.save(logEntry);

    return {
      success: true,
      isVisibleToUser: logEntry.isVisibleToUser,
    };
  }

  async getPatientEvaluations(
    patientId: number,
    includeHidden: boolean = false,
  ): Promise<any[]> {
    this.logger.log(
      `Fetching plate evaluations for patient ${patientId}, includeHidden: ${includeHidden}`,
    );

    const whereCondition: any = {
      user: { id: patientId },
      isSuccess: true,
    };

    if (!includeHidden) {
      whereCondition.isHiddenFromNutritionist = false;
    }

    const logs = await this.plateEvaluationLogRepository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      select: [
        'id',
        'ingredients',
        'score',
        'positives',
        'issues',
        'suggestions',
        'userNotes',
        'nutritionistNotes',
        'isVisibleToUser',
        'isHiddenFromNutritionist',
        'pointsEarned',
        'createdAt',
        'updatedAt',
      ],
    });

    return logs.map((log) => ({
      id: log.id,
      ingredients: log.ingredients,
      score: log.score,
      positives: log.positives,
      issues: log.issues,
      suggestions: log.suggestions,
      isVisibleToUser: log.isVisibleToUser,
      isHiddenFromNutritionist: log.isHiddenFromNutritionist,
      userNotes: log.userNotes,
      nutritionistNotes: log.nutritionistNotes,
      pointsEarned: log.pointsEarned,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    }));
  }

  async toggleNutritionistHide(
    logId: number,
    nutritionistId: number,
  ): Promise<{ success: boolean; isHidden: boolean }> {
    this.logger.log(
      `Toggling nutritionist hide status for evaluation ${logId} by nutritionist ${nutritionistId}`,
    );

    // Note: In a real implementation, you might want to verify that the nutritionist
    // has permission to view this patient's data
    const logEntry = await this.plateEvaluationLogRepository.findOne({
      where: { id: logId },
    });

    if (!logEntry) {
      throw new Error('Evaluation not found');
    }

    logEntry.isHiddenFromNutritionist = !logEntry.isHiddenFromNutritionist;
    await this.plateEvaluationLogRepository.save(logEntry);

    return {
      success: true,
      isHidden: logEntry.isHiddenFromNutritionist,
    };
  }

  async updateNutritionistNotes(
    logId: number,
    nutritionistId: number,
    notes: string,
  ): Promise<{ success: boolean; notes: string }> {
    this.logger.log(
      `Updating nutritionist notes for evaluation ${logId} by nutritionist ${nutritionistId}`,
    );

    const logEntry = await this.plateEvaluationLogRepository.findOne({
      where: { id: logId },
    });

    if (!logEntry) {
      throw new Error('Evaluation not found');
    }

    logEntry.nutritionistNotes = notes;
    await this.plateEvaluationLogRepository.save(logEntry);

    return {
      success: true,
      notes: logEntry.nutritionistNotes,
    };
  }
}
