// scripts/seed.ts
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';
import { IngredientType } from '../src/plate-ingredient/ingredient-type.entity';
import { IngredientSubtype } from '../src/plate-ingredient/ingredient-subtype.entity';
import { PlateIngredient } from '../src/plate-ingredient/plate-ingredient.entity';
import { IngredientTypeEnum } from '../src/plate-ingredient/ingredient-type.enum';
import { ingredients } from './data/ingredients';

// Load environment variables from .development.env
config({ path: resolve(__dirname, '../.development.env') });

const typeLabelToEnum: Record<string, IngredientTypeEnum> = {
  'Verduras y Frutas': IngredientTypeEnum.VEGETABLES_AND_FRUITS,
  'Alimentos integrales': IngredientTypeEnum.WHOLE_GRAIN_FOODS,
  'Alimentos con proteínas': IngredientTypeEnum.PROTEIN_FOODS,
  'Aceites y grasas': IngredientTypeEnum.OILS_AND_FATS,
  'Otros': IngredientTypeEnum.OTHER
};

const subtypeLabelToEnum: Record<string, string> = {
  // Verduras y Frutas
  'Verduras de hoja': 'leafy_greens',
  'Verduras de raíz': 'root_vegetables',
  'Frutas': 'fruits',
  'Crucíferas': 'cruciferous',
  'Bulbos aromáticos': 'alliums',
  'Hongos': 'mushrooms',
  'Otras verduras': 'other_vegetables',
  
  // Alimentos integrales
  'Granos enteros': 'whole_grains',
  'Pseudo granos': 'pseudo_grains',
  'Granos antiguos': 'ancient_grains',
  'Otros granos': 'other_grains',
  
  // Alimentos con proteínas
  'Legumbres': 'legumes',
  'Proteínas animales': 'animal_proteins',
  'Proteínas vegetales': 'plant_proteins',
  'Lácteos': 'dairy',
  'Huevos': 'eggs',
  
  // Aceites y grasas
  'Aceites vegetales': 'plant_oils',
  'Grasas animales': 'animal_fats',
  'Nueces y semillas': 'nuts_and_seeds',
  
  // Otros
  'Especias': 'spices',
  'Aderezos': 'condiments',
  'Endulzantes': 'sweeteners',
  'Hierbas': 'herbs'
};

const ingredientTypes = [
  {
    name: IngredientTypeEnum.VEGETABLES_AND_FRUITS,
    label: 'Verduras y Frutas',
    description: 'Alimentos vegetales frescos ricos en fibra, vitaminas y minerales.',
    color: '#4CAF50',
    subtypes: [
      { name: 'leafy_greens', label: 'Verduras de hoja', description: 'Acelga, espinaca, lechuga, rúcula.' },
      { name: 'root_vegetables', label: 'Verduras de raíz', description: 'Zanahoria, remolacha, batata, rabanito.' },
      { name: 'fruits', label: 'Frutas', description: 'Manzana, banana, naranja, frutilla, uva.' },
      { name: 'cruciferous', label: 'Crucíferas', description: 'Brócoli, coliflor, repollo, coles de Bruselas.' },
      { name: 'alliums', label: 'Bulbos aromáticos', description: 'Cebolla, ajo, puerro, cebolla de verdeo.' },
      { name: 'mushrooms', label: 'Hongos', description: 'Champiñones, portobellos, hongos secos.' },
      { name: 'other_vegetables', label: 'Otras verduras', description: 'Zapallito, berenjena, tomate, morrón.' }
    ]
  },
  {
    name: IngredientTypeEnum.WHOLE_GRAIN_FOODS,
    label: 'Alimentos integrales',
    description: 'Fuentes de energía que aportan fibra y nutrientes esenciales.',
    color: '#FFC107',
    subtypes: [
      {
        name: 'whole_grains',
        label: 'Granos enteros',
        description: 'Avena arrollada, arroz integral, cebada perlada, trigo entero.'
      },
      {
        name: 'pseudo_grains',
        label: 'Pseudo granos',
        description: 'Quinoa, amaranto, trigo sarraceno.'
      },
      {
        name: 'ancient_grains',
        label: 'Granos antiguos',
        description: 'Espelta, farro, kamut, teff (menos comunes, de consumo creciente).'
      },
      {
        name: 'other_grains',
        label: 'Otros granos',
        description: 'Maíz, sorgo, mijo.'
      }
    ]
  },
  {
    name: IngredientTypeEnum.PROTEIN_FOODS,
    label: 'Alimentos con proteínas',
    description: 'Alimentos ricos en proteínas, fundamentales para la reparación y crecimiento del cuerpo.',
    color: '#FF5722',
    subtypes: [
      { name: 'legumes', label: 'Legumbres', description: 'Lentejas, porotos, garbanzos, arvejas partidas.' },
      { name: 'animal_proteins', label: 'Proteínas animales', description: 'Carne vacuna, pollo, pescado, cerdo.' },
      { name: 'plant_proteins', label: 'Proteínas vegetales', description: 'Soja, tofu, tempeh, heura.' },
      { name: 'dairy', label: 'Lácteos', description: 'Leche, yogur, quesos (frescos y duros).' },
      { name: 'eggs', label: 'Huevos', description: 'Huevo de gallina, huevos de codorniz.' }
    ]
  },
  {
    name: IngredientTypeEnum.OILS_AND_FATS,
    label: 'Aceites y grasas',
    description: 'Fuentes de energía y ácidos grasos esenciales.',
    color: '#FFEB3B',
    subtypes: [
      { name: 'plant_oils', label: 'Aceites vegetales', description: 'Aceite de girasol, maíz, oliva, canola.' },
      { name: 'animal_fats', label: 'Grasas animales', description: 'Grasa vacuna (sebo), manteca, grasa de cerdo.' },
      { name: 'nuts_and_seeds', label: 'Nueces y semillas', description: 'Nueces, almendras, chía, lino, girasol.' }
    ]
  },
  {
    name: IngredientTypeEnum.OTHER,
    label: 'Otros',
    description: 'Ingredientes no principales pero presentes en la preparación de alimentos.',
    color: '#9E9E9E',
    subtypes: [
      { name: 'spices', label: 'Especias', description: 'Pimienta, pimentón, cúrcuma, comino.' },
      { name: 'condiments', label: 'Aderezos', description: 'Mostaza, mayonesa, salsa de soja, ketchup.' },
      { name: 'sweeteners', label: 'Endulzantes', description: 'Azúcar, miel, stevia, edulcorantes artificiales.' },
      { name: 'herbs', label: 'Hierbas', description: 'Perejil, orégano, albahaca, tomillo.' }
    ]
  }
];


async function seed() {
  console.log('Starting seed process...');
  
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [IngredientType, IngredientSubtype, PlateIngredient],
    synchronize: false,
    logging: true
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    await dataSource.transaction(async (manager) => {
      const ingredientTypeRepository = manager.getRepository(IngredientType);
      const ingredientSubtypeRepository = manager.getRepository(IngredientSubtype);
      const plateIngredientRepository = manager.getRepository(PlateIngredient);
      // Clear existing data
      console.log('Clearing existing data...');
      await plateIngredientRepository.delete({});
      await ingredientSubtypeRepository.delete({});
      await ingredientTypeRepository.delete({});

      // Create ingredient types and subtypes
      console.log('Creating ingredient types and subtypes...');
      for (const type of ingredientTypes) {
        const { subtypes, ...typeInfo } = type;
        
        // Check if type already exists
        let ingredientType = await ingredientTypeRepository.findOne({ where: { name: typeInfo.name } });
        if (!ingredientType) {
          ingredientType = await ingredientTypeRepository.save(typeInfo);
          console.log(`Created ingredient type: ${ingredientType.name}`);
        } else {
          console.log(`Ingredient type already exists: ${ingredientType.name}`);
        }

        for (const subtype of subtypes) {
          // Check if subtype already exists
          let ingredientSubtype = await ingredientSubtypeRepository.findOne({ 
            where: { 
              name: subtype.name,
              type_id: ingredientType.id 
            } 
          });
          
          if (!ingredientSubtype) {
            ingredientSubtype = await ingredientSubtypeRepository.save({
              ...subtype,
              type_id: ingredientType.id
            });
            console.log(`Created subtype: ${ingredientSubtype.name} for type: ${ingredientType.name}`);
          } else {
            console.log(`Subtype already exists: ${ingredientSubtype.name} for type: ${ingredientType.name}`);
          }
        }
      }

      // Create ingredients
      console.log('Creating ingredients...');
      let successCount = 0;
      let errorCount = 0;
      for (const ingredient of ingredients) {
        try {
          const typeEnum = typeLabelToEnum[ingredient.type];
          if (!typeEnum) {
            console.error(`Unknown ingredient type: ${ingredient.type} for ingredient: ${ingredient.name}`);
            errorCount++;
            continue;
          }
          const ingredientType = await ingredientTypeRepository.findOne({ where: { name: typeEnum } });
          if (!ingredientType) {
            console.error(`Ingredient type ${typeEnum} not found for ingredient: ${ingredient.name}`);
            errorCount++;
            continue;
          }
          const subtypeEnum = subtypeLabelToEnum[ingredient.subtype];
          if (!subtypeEnum) {
            console.error(`Unknown ingredient subtype: ${ingredient.subtype} for ingredient: ${ingredient.name}`);
            errorCount++;
            continue;
          }
          const ingredientSubtype = await ingredientSubtypeRepository.findOne({ where: { name: subtypeEnum } });
          if (!ingredientSubtype) {
            console.error(`Ingredient subtype ${subtypeEnum} not found for ingredient: ${ingredient.name}`);
            errorCount++;
            continue;
          }
          const ingredientToCreate = plateIngredientRepository.create({
            name: ingredient.name,
            imageUrl: ingredient.imageUrl,
            type: ingredientType,
            subtype: ingredientSubtype,
            nutrients: {
              energy: ingredient.nutrients.calories_kcal,
              protein: ingredient.nutrients.proteins_g,
              fat: ingredient.nutrients.fats_g,
              carbs: ingredient.nutrients.carbohydrates_g
            },
            dietary: {
              isVegetarian: ingredient.dietary.vegetarian,
              isVegan: ingredient.dietary.vegan
            },
            source: ingredient.source
          });
          const createdIngredient = await plateIngredientRepository.save(ingredientToCreate);
          console.log(`Created ingredient: ${createdIngredient.name}`);
          successCount++;
        } catch (error) {
          console.error(`Error creating ingredient ${ingredient.name}:`, error);
          errorCount++;
        }
      }
      console.log(`\nSeed completed. Successfully created: ${successCount}, Errors: ${errorCount}, Total ingredients: ${ingredients.length}`);
    });

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error during seed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('Database connection closed');
  }
}

seed();
