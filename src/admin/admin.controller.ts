import {
  Body,
  Controller,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AwsCognitoService } from '../auth/aws-cognito.service';
import { LoginDto } from '../auth/dto/login.dto';
import { SignUpDto } from '../auth/dto/signup.dto';

@Controller('admin')
export class AdminController {
  constructor(private awsCognitoService: AwsCognitoService) {}

  @Post('/signup')
  @UsePipes(ValidationPipe)
  async register(@Body() authRegisterUserDto: SignUpDto) {
    try {
      return await this.awsCognitoService.registerAdmin(authRegisterUserDto);
    } catch (error) {
      console.error('Admin registration error:', error);
      throw new HttpException(
        error.message || 'Error al registrar el administrador',
        HttpStatus.BAD_REQUEST,
      );
    }
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
