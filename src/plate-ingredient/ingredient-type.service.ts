import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IngredientType } from './ingredient-type.entity';
import { IngredientTypeEnum } from './ingredient-type.enum';

@Injectable()
export class IngredientTypeService {
  constructor(
    @Inject('INGREDIENT_TYPE_REPOSITORY')
    private readonly ingredientTypeRepository: Repository<IngredientType>,
  ) {}

  async findAll(): Promise<IngredientType[]> {
    return this.ingredientTypeRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  findOne(id: number): Promise<IngredientType> {
    return this.ingredientTypeRepository.findOneBy({ id });
  }

  findOneByName(name: IngredientTypeEnum): Promise<IngredientType> {
    return this.ingredientTypeRepository.findOneBy({ name });
  }

  create(data: Partial<IngredientType>): Promise<IngredientType> {
    const type = this.ingredientTypeRepository.create(data);
    return this.ingredientTypeRepository.save(type);
  }

  async update(id: number, data: Partial<IngredientType>): Promise<IngredientType> {
    await this.ingredientTypeRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.ingredientTypeRepository.delete(id);
  }
} 