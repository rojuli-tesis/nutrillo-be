import { Admin } from '../admin/admin.entity';
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
  @Column({ default: false })
  isRegistrationFinished: boolean;
  @Column({ default: false })
  isActive: boolean;
  @Column()
  cognitoId: string;
  @ManyToOne(() => Admin, (admin) => admin.users)
  admin: Admin;
}
