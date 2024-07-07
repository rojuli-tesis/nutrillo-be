import { IsEmail, IsNotEmpty } from 'class-validator';

export enum InviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

export class CreateInviteDto {
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  lastName: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
