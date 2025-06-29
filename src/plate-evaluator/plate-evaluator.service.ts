import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { EvaluatePlateDto } from './dto/evaluate-plate.dto';

interface PlateEvaluation {
  score: number;
  positives: string[];
  issues: string[];
  suggestions: string;
}

@Injectable()
export class PlateEvaluatorService {
  private readonly logger = new Logger(PlateEvaluatorService.name);

  constructor(private readonly configService: ConfigService) {}

  async evaluatePlate(evaluatePlateDto: EvaluatePlateDto): Promise<PlateEvaluation> {
    try {
      const { ingredients } = evaluatePlateDto;
      
      if (ingredients.length < 3) {
        throw new Error('At least 3 ingredients are required for evaluation');
      }

      const prompt = this.buildEvaluationPrompt(ingredients);

      // Instantiate OpenAI client only when needed
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (!apiKey) {
        this.logger.warn('OPENAI_API_KEY not found in environment variables');
        throw new Error('OPENAI_API_KEY not found in environment variables');
      }
      const openai = new OpenAI({ apiKey });
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Sos una nutricionista argentina que analiza platos de comida de forma clara, práctica y educativa.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      const evaluation = completion.choices[0]?.message?.content;
      
      if (!evaluation) {
        throw new Error('No evaluation received from OpenAI');
      }

      // Parse JSON response
      try {
        const parsedEvaluation = JSON.parse(evaluation);
        this.logger.log(`Plate evaluation completed for ${ingredients.length} ingredients`);
        return parsedEvaluation;
      } catch (parseError) {
        this.logger.error('Error parsing JSON response:', parseError);
        throw new Error('Invalid JSON response from OpenAI');
      }

    } catch (error) {
      this.logger.error('Error evaluating plate:', error);
      throw new Error(`Error evaluating plate: ${error.message}`);
    }
  }

  private buildEvaluationPrompt(ingredients: any[]): string {
    const ingredientNames = ingredients.map(ing => ing.name).join(', ');

    return `Estás ayudando a evaluar un plato de comida. Te paso una lista de ingredientes. Respondé únicamente en formato JSON, sin explicaciones, sin introducción ni cierre.

Ingredientes del plato: ${ingredientNames}

Evaluá lo siguiente:

- "score": un número del 1 al 10 que refleje qué tan saludable y equilibrado es el plato.
- "positives": array con los aspectos positivos detectados (presencia de vegetales, proteínas magras, pocas grasas, buena variedad, etc.).
- "issues": array con los aspectos a mejorar (demasiadas grasas saturadas, falta de verduras, exceso de procesados, etc.).
- "suggestions": un solo párrafo, breve y claro, con sugerencias concretas para mejorar el plato sin perder sabor ni cultura local.

Devolvé SOLO el JSON. No agregues comentarios ni texto fuera de la estructura.`;
  }
} 