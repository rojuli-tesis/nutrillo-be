import { Controller, Get, Post, Body, Param, Delete, Put, UseInterceptors, UploadedFile, ParseIntPipe, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PlateIngredientService } from './plate-ingredient.service';
import { IngredientTypeService } from './ingredient-type.service';
import { IngredientSubtypeService } from './ingredient-subtype.service';
import { IngredientTypeEnum } from './ingredient-type.enum';
import type { Multer } from 'multer';

@Controller('plate-ingredient')
export class PlateIngredientController {
  constructor(
    private readonly plateIngredientService: PlateIngredientService,
    private readonly ingredientTypeService: IngredientTypeService,
    private readonly ingredientSubtypeService: IngredientSubtypeService,
  ) {}

  @Get()
  findAll(@Query('typeId') typeId?: number) {
    return this.plateIngredientService.findAll(typeId);
  }

  @Get('types')
  findAllTypes() {
    return this.ingredientTypeService.findAll();
  }

  @Get('subtypes')
  findAllSubtypes(@Query('type') type?: IngredientTypeEnum) {
    if (type) {
      return this.ingredientSubtypeService.findByType(type);
    }
    return this.ingredientSubtypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.plateIngredientService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(@Body() formData: any, @UploadedFile() file: Express.Multer.File) {
    // Parse nested objects from form data
    const data = {
      ...formData,
      nutrients: formData.nutrients ? JSON.parse(formData.nutrients) : {},
      dietary: formData.dietary ? JSON.parse(formData.dietary) : {},
      metadata: formData.metadata ? JSON.parse(formData.metadata) : {},
      type: formData.type ? JSON.parse(formData.type) : undefined,
      subtype: formData.subtype ? JSON.parse(formData.subtype) : undefined,
    };

    return this.plateIngredientService.create(data, file);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() formData: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Parse nested objects from form data
    const data = {
      ...formData,
      nutrients: formData.nutrients ? JSON.parse(formData.nutrients) : {},
      dietary: formData.dietary ? JSON.parse(formData.dietary) : {},
      metadata: formData.metadata ? JSON.parse(formData.metadata) : {},
      type: formData.type ? JSON.parse(formData.type) : undefined,
      subtype: formData.subtype ? JSON.parse(formData.subtype) : undefined,
    };

    return this.plateIngredientService.update(id, data, file);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.plateIngredientService.remove(id);
  }
} 