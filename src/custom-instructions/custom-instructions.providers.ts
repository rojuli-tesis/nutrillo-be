import { DataSource } from 'typeorm';
import { CustomInstructions } from './custom-instructions.entity';

export const customInstructionsProviders = [
  {
    provide: 'CUSTOM_INSTRUCTIONS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CustomInstructions),
    inject: ['DATA_SOURCE'],
  },
];
