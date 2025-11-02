import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IngredientSubtype } from './ingredient-subtype.entity';
import { IngredientTypeEnum } from './ingredient-type.enum';

@Injectable()
export class IngredientSubtypeService {
  constructor(
    @Inject('INGREDIENT_SUBTYPE_REPOSITORY')
    private readonly ingredientSubtypeRepository: Repository<IngredientSubtype>,
  ) {}

  async findAll(): Promise<IngredientSubtype[]> {
    return this.ingredientSubtypeRepository.find({
      relations: ['type'],
      order: {
        name: 'ASC',
      },
    });
  }

  async findByType(type: IngredientTypeEnum): Promise<IngredientSubtype[]> {
    return this.ingredientSubtypeRepository.find({
      where: { type: { name: type } },
      relations: ['type'],
      order: {
        name: 'ASC',
      },
    });
  }

  findOne(id: number): Promise<IngredientSubtype> {
    return this.ingredientSubtypeRepository.findOne({
      where: { id },
      relations: ['type'],
    });
  }

  create(data: Partial<IngredientSubtype>): Promise<IngredientSubtype> {
    const subtype = this.ingredientSubtypeRepository.create(data);
    return this.ingredientSubtypeRepository.save(subtype);
  }

  async update(
    id: number,
    data: Partial<IngredientSubtype>,
  ): Promise<IngredientSubtype> {
    await this.ingredientSubtypeRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.ingredientSubtypeRepository.delete(id);
  }
}
