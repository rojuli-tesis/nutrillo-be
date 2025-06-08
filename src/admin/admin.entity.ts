import { Invite } from '../invite/invite.entity';
import { User } from '../user/user.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Admin {
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
  @OneToMany(() => User, (user) => user.admin)
  users: User[];
  @Column({ default: false })
  enabled: boolean;
  @OneToMany(() => Invite, (invite) => invite.admin)
  invites: Invite[];
}
