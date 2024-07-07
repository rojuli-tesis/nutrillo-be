import { IsEmail, IsString, Matches } from 'class-validator';

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
  inviteCode: string;
}

export class createUserDto {
  email: string;
  firstName: string;
  lastName: string;
}

export class createAdminDto {
  email: string;
  firstName: string;
  lastName: string;
}
