import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PlateIngredient } from './plate-ingredient.entity';
import { IngredientTypeService } from './ingredient-type.service';
import { S3Service } from '../s3/s3.service';

interface PlateIngredientInput {
  name: string;
  typeId?: number;
  imageUrl?: string;
  nutrients?: {
    energy?: number;
    protein?: number;
    fat?: number;
    saturatedFat?: number;
    carbs?: number;
    sugar?: number;
    fiber?: number;
    sodium?: number;
  };
  dietary?: {
    isVegan?: boolean;
    isVegetarian?: boolean;
    allergens?: string[];
  };
  metadata?: any;
  source?: string;
}

@Injectable()
export class PlateIngredientService {
  constructor(
    @Inject('PLATE_INGREDIENT_REPOSITORY')
    private readonly plateIngredientRepository: Repository<PlateIngredient>,
    private readonly ingredientTypeService: IngredientTypeService,
    private readonly s3Service: S3Service,
  ) {}

  findAll(typeId?: number): Promise<PlateIngredient[]> {
    if (typeId) {
      return this.plateIngredientRepository.find({
        where: { type: { id: typeId } },
        relations: ['type', 'subtype'],
        order: { name: 'ASC' }
      });
    }
    return this.plateIngredientRepository.find({
      relations: ['type', 'subtype'],
      order: { name: 'ASC' }
    });
  }

  findOne(id: number): Promise<PlateIngredient> {
    return this.plateIngredientRepository.findOne({
      where: { id },
      relations: ['type', 'subtype']
    });
  }

  async create(data: PlateIngredientInput, file?: Express.Multer.File): Promise<PlateIngredient> {
    const { typeId, ...ingredientData } = data;
    const ingredient = this.plateIngredientRepository.create(ingredientData);
    
    if (typeId) {
      const type = await this.ingredientTypeService.findOne(typeId);
      if (type) {
        ingredient.type = type;
      }
    }

    // Handle file upload if present
    if (file) {
      ingredient.imageUrl = await this.s3Service.uploadFile(file, 'ingredients');
    } else {
      // Set a default image URL if no file is provided
      ingredient.imageUrl = 'https://nutrillo-test2.s3.us-east-2.amazonaws.com/ingredients/default-ingredient.png';
      
    }
    
    return this.plateIngredientRepository.save(ingredient);
  }

  async update(id: number, data: PlateIngredientInput, file?: Express.Multer.File): Promise<PlateIngredient> {
    const { typeId, ...ingredientData } = data;
    const ingredient = await this.findOne(id);
    
    if (!ingredient) {
      throw new Error(`Ingredient with id ${id} not found`);
    }

    if (typeId) {
      const type = await this.ingredientTypeService.findOne(typeId);
      if (type) {
        ingredient.type = type;
      }
    }

    // Handle file upload if present
    if (file) {
      ingredient.imageUrl = await this.s3Service.uploadFile(file, 'ingredients');
    }

    // Update basic properties
    ingredient.name = ingredientData.name;
    ingredient.source = ingredientData.source || ingredient.source;

    // Update nested objects by merging with existing data
    if (ingredientData.nutrients) {
      ingredient.nutrients = {
        ...ingredient.nutrients,
        ...ingredientData.nutrients
      };
    }

    if (ingredientData.dietary) {
      ingredient.dietary = {
        ...ingredient.dietary,
        ...ingredientData.dietary
      };
    }

    if (ingredientData.metadata) {
      ingredient.metadata = {
        ...ingredient.metadata,
        ...ingredientData.metadata
      };
    }

    // Save the updated ingredient
    return this.plateIngredientRepository.save(ingredient);
  }

  async remove(id: number): Promise<void> {
    await this.plateIngredientRepository.delete(id);
  }
} 