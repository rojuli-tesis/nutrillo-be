import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomInstructionsDto } from './create-custom-instructions.dto';

export class UpdateCustomInstructionsDto extends PartialType(CreateCustomInstructionsDto) {}
