import { PartialType } from '@nestjs/mapped-types';
import { CreateUserPlanDto } from './create-user-plan.dto';

export class UpdateUserPlanDto extends PartialType(CreateUserPlanDto) {}
