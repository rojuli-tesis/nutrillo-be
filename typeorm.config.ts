import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { PlateIngredient } from './src/plate-ingredient/plate-ingredient.entity';
import { IngredientType } from './src/plate-ingredient/ingredient-type.entity';
import { IngredientSubtype } from './src/plate-ingredient/ingredient-subtype.entity';

// Load environment variables from the correct path
const envPath = path.resolve(__dirname, '.development.env');
dotenv.config({ path: envPath });

// Log the configuration for debugging
console.log('Database Configuration:', {
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  username: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DB,
});

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'nutrillodb',
  entities: [PlateIngredient, IngredientType, IngredientSubtype],
  migrations: [path.join(__dirname, 'src/migrations/*{.ts,.js}')],
  synchronize: false,
  logging: true,
}); 