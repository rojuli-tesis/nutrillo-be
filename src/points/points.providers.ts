import { DataSource } from 'typeorm';
import { UserPoints } from './user-points.entity';
import { UserStreaks } from './user-streaks.entity';
import { PointTransactions } from './point-transactions.entity';
import { DailyActivity } from './daily-activity.entity';

export const pointsProviders = [
  {
    provide: 'USER_POINTS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(UserPoints),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'USER_STREAKS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(UserStreaks),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'POINT_TRANSACTIONS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(PointTransactions),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'DAILY_ACTIVITY_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(DailyActivity),
    inject: ['DATA_SOURCE'],
  },
];
