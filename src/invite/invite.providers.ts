import { DataSource } from 'typeorm';
import { Invite } from './invite.entity';
import { Admin } from '../admin/admin.entity';

export const inviteProviders = [
  {
    provide: 'INVITE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Invite),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ADMIN_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Admin),
    inject: ['DATA_SOURCE'],
  },
];
