import {
  Body,
  Controller,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { AwsCognitoService } from 'src/auth/aws-cognito.service';
import { LoginDto } from 'src/auth/dto/login.dto';
import { SignUpDto } from 'src/auth/dto/signup.dto';

@Controller('admin')
export class AdminController {
  constructor(private awsCognitoService: AwsCognitoService) {}

  @Post('/signup')
  @UsePipes(ValidationPipe)
  async register(@Body() authRegisterUserDto: SignUpDto) {
    return await this.awsCognitoService.registerAdmin(authRegisterUserDto);
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
    try {
      const result =
        await this.awsCognitoService.authenticateAdmin(authLoginUserDto);
      res.cookie('jwt', result.accessToken, {
        httpOnly: true,
        secure: true,
      });
      res.status(200).json({ message: 'Login successful' });
    } catch (e) {
      res.status(401).send({ message: 'Email o contraseña incorrectos' });
    }
  }
}
