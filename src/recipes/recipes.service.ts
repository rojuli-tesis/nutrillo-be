import { Injectable, Logger, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SavedRecipe } from './recipe.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { RecipeResponseDto } from './dto/recipe-response.dto';
import { User } from '../user/user.entity';

@Injectable()
export class RecipesService {
  private readonly logger = new Logger(RecipesService.name);

  constructor(
    @Inject('SAVED_RECIPE_REPOSITORY')
    private savedRecipeRepository: Repository<SavedRecipe>,
  ) {}

  async create(createRecipeDto: CreateRecipeDto, userId: number): Promise<RecipeResponseDto> {
    this.logger.log(`Creating new recipe for user ${userId}`);

    const recipe = this.savedRecipeRepository.create({
      ...createRecipeDto,
      user: { id: userId } as User,
    });

    const savedRecipe = await this.savedRecipeRepository.save(recipe);

    return this.mapToResponseDto(savedRecipe);
  }

  async findAll(userId: number): Promise<RecipeResponseDto[]> {
    this.logger.log(`Fetching all recipes for user ${userId}`);

    const recipes = await this.savedRecipeRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    return recipes.map(recipe => this.mapToResponseDto(recipe));
  }

  async findOne(id: string, userId: number): Promise<RecipeResponseDto> {
    this.logger.log(`Fetching recipe ${id} for user ${userId}`);

    const recipe = await this.savedRecipeRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }

    // Check if recipe belongs to the user
    if (recipe.user.id !== userId) {
      throw new ForbiddenException('You do not have permission to access this recipe');
    }

    return this.mapToResponseDto(recipe);
  }

  async remove(id: string, userId: number): Promise<void> {
    this.logger.log(`Deleting recipe ${id} for user ${userId}`);

    const recipe = await this.savedRecipeRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }

    // Check if recipe belongs to the user
    if (recipe.user.id !== userId) {
      throw new ForbiddenException('You do not have permission to delete this recipe');
    }

    await this.savedRecipeRepository.remove(recipe);
    this.logger.log(`Recipe ${id} deleted successfully`);
  }

  private mapToResponseDto(recipe: SavedRecipe): RecipeResponseDto {
    return {
      id: recipe.id,
      userId: recipe.user.id,
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      cookingTime: recipe.cookingTime,
      difficulty: recipe.difficulty,
      nutritionalBenefits: recipe.nutritionalBenefits || [],
      createdAt: recipe.createdAt,
    };
  }
}

