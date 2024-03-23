import {
  Body,
  Controller,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AwsCognitoService } from './aws-cognito.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private awsCognitoService: AwsCognitoService) {}

  @Post('/signup')
  async register(@Body() authRegisterUserDto: SignUpDto) {
    return await this.awsCognitoService.registerUser(authRegisterUserDto);
  }

  @Post('/login')
  @UsePipes(ValidationPipe)
  async login(
    @Body() authLoginUserDto: LoginDto,
    @Res({
      passthrough: true,
    })
    res: Response,
  ) {
    const result =
      await this.awsCognitoService.authenticateUser(authLoginUserDto);
    res.cookie('jwt', result.accessToken, {
      httpOnly: true,
      secure: true,
    });
    return result;
  }
}
