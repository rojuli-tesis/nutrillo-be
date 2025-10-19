import { DataSource } from 'typeorm';
import { UserPlan } from './user-plan.entity';

export const userPlanProviders = [
  {
    provide: 'USER_PLAN_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(UserPlan),
    inject: ['DATA_SOURCE'],
  },
];
