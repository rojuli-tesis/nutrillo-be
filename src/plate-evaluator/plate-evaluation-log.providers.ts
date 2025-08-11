import { DataSource } from 'typeorm';
import { PlateEvaluationLog } from './plate-evaluation-log.entity';

export const plateEvaluationLogProviders = [
  {
    provide: 'PLATE_EVALUATION_LOG_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(PlateEvaluationLog),
    inject: ['DATA_SOURCE'],
  },
]; 