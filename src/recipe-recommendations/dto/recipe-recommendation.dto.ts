export interface Recipe {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  nutritionalBenefits: string[];
}

export class RecipeRecommendationResponseDto {
  recipes: Recipe[];
  pointsSpent: number;
  remainingPoints: number;
}
