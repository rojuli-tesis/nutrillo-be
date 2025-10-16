import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { RecipeResponseDto } from './dto/recipe-response.dto';

interface JwtUser {
  cognitoId: string;
  username: string;
  isAdmin: boolean;
  userId: number;
}

@Controller('recipes')
@UseGuards(JwtAuthGuard)
export class RecipesController {
  private readonly logger = new Logger(RecipesController.name);

  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createRecipeDto: CreateRecipeDto,
    @Request() req: Express.Request & { user: JwtUser }
  ): Promise<RecipeResponseDto> {
    this.logger.log(`User ${req.user.userId} creating new recipe`);
    return await this.recipesService.create(createRecipeDto, req.user.userId);
  }

  @Get()
  async findAll(
    @Request() req: Express.Request & { user: JwtUser }
  ): Promise<RecipeResponseDto[]> {
    this.logger.log(`User ${req.user.userId} fetching all recipes`);
    return await this.recipesService.findAll(req.user.userId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: Express.Request & { user: JwtUser }
  ): Promise<RecipeResponseDto> {
    this.logger.log(`User ${req.user.userId} fetching recipe ${id}`);
    return await this.recipesService.findOne(id, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Request() req: Express.Request & { user: JwtUser }
  ): Promise<void> {
    this.logger.log(`User ${req.user.userId} deleting recipe ${id}`);
    await this.recipesService.remove(id, req.user.userId);
  }
}

