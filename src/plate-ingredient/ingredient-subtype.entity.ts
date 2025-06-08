import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IngredientType } from './ingredient-type.entity';

@Entity('ingredient_subtype')
export class IngredientSubtype {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  label: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'type_id' })
  type_id: number;

  @ManyToOne(() => IngredientType, type => type.subtypes)
  @JoinColumn({ name: 'type_id' })
  type: IngredientType;
} 