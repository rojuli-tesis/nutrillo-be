import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';
import { Admin } from '../../admin/admin.entity';

export class SignUpDto {
  @IsEmail()
  email: string;
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$&+,:;=?@#|'<>.^*()%!-])[A-Za-z\d@$&+,:;=?@#|'<>.^*()%!-]{8,}$/,
    { message: 'invalid password' },
  )
  password: string;
  @IsString()
  firstName: string;
  @IsString()
  lastName: string;
  @IsString()
  @IsOptional()
  inviteCode: string;
}

export class createUserDto {
  email: string;
  firstName: string;
  lastName: string;
  admin: Admin;
}

export class createAdminDto {
  email: string;
  firstName: string;
  lastName: string;
}
