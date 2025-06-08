import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IngredientType } from './ingredient-type.entity';
import { IngredientSubtype } from './ingredient-subtype.entity';

@Entity()
export class PlateIngredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => IngredientType, { nullable: true })
  @JoinColumn({ name: 'type_id' })
  type: IngredientType;

  @ManyToOne(() => IngredientSubtype, { nullable: true })
  @JoinColumn({ name: 'subtype_id' })
  subtype: IngredientSubtype;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column()
  imageUrl: string;

  @Column({ type: 'json', nullable: true })
  nutrients: {
    energy?: number;
    protein?: number;
    fat?: number;
    saturatedFat?: number;
    carbs?: number;
    sugar?: number;
    fiber?: number;
    sodium?: number;
  };

  @Column({ type: 'json', nullable: true })
  dietary: {
    isVegan?: boolean;
    isVegetarian?: boolean;
    allergens?: string[];
  };

  @Column({ default: 'open_food_facts' })
  source: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 