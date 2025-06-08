import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { InviteStatus } from './dto/invite.dto';
import { Admin } from '../admin/admin.entity';

@Entity()
export class Invite {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  firstName: string;
  @Column()
  lastName: string;
  @Column()
  email: string;
  @Column({
    length: 6,
    unique: true,
  })
  code: string;
  @Column({
    type: 'timestamp',
  })
  expiresAt: Date;
  @Column({
    nullable: true,
    type: 'timestamp',
  })
  acceptedAt: Date;
  @Column({
    type: 'enum',
    enum: InviteStatus,
    default: InviteStatus.PENDING,
  })
  status: InviteStatus;
  @ManyToOne(() => Admin, (admin) => admin.invites)
  admin: Admin;
}
