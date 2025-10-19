export class UserPlanResponseDto {
  id: string;
  userId: number;
  title: string;
  description?: string;
  fileName: string;
  fileUrl?: string;
  nutritionist?: string;
  isActive: boolean;
  uploadDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
