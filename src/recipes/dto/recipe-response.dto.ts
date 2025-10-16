export class RecipeResponseDto {
  id: string;
  userId: number;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  nutritionalBenefits: string[];
  createdAt: Date;
}

