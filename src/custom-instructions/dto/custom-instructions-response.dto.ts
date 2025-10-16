export class CustomInstructionsResponseDto {
  id: number;
  instructions: string;
  title?: string;
  description?: string;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}
