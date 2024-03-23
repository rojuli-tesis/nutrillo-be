import { Admin } from 'src/admin/admin.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  firstName: string;
  @Column()
  lastName: string;
  @Column()
  email: string;
  @Column()
  cognitoId: string;
  @ManyToOne(() => Admin, (admin) => admin.users)
  admin: Admin;
}
