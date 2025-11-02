import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IngredientTypeEnum } from './ingredient-type.enum';
import { IngredientSubtype } from './ingredient-subtype.entity';

@Entity('ingredient_type')
export class IngredientType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: IngredientTypeEnum,
    unique: true,
  })
  name: IngredientTypeEnum;

  @Column({ nullable: true })
  label: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  color: string;

  @OneToMany(() => IngredientSubtype, (subtype) => subtype.type)
  subtypes: IngredientSubtype[];
}
