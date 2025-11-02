import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { IngredientTypeService } from './ingredient-type.service';
import { IngredientType } from './ingredient-type.entity';

@Controller('ingredient-types')
export class IngredientTypeController {
  constructor(private readonly service: IngredientTypeService) {}

  @Get()
  findAll(): Promise<IngredientType[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<IngredientType> {
    return this.service.findOne(Number(id));
  }

  @Post()
  create(@Body() data: Partial<IngredientType>): Promise<IngredientType> {
    return this.service.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<IngredientType>,
  ): Promise<IngredientType> {
    return this.service.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(Number(id));
  }
}
