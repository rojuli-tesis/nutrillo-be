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
import { AwsCognitoService } from './aws-cognito.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private awsCognitoService: AwsCognitoService,
    private userService: UserService,
  ) {}

  @Post('/signup')
  async register(@Body() authRegisterUserDto: SignUpDto) {
    // TODO: this should redirect to registration/personaldata
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
    const accessStatus = await this.userService.getUserAccessStatus(
      result.userId,
    );
    let nextPath = '/';
    if (!accessStatus.isRegistrationFinished) {
      // TODO: can set last completed step if they closed
      nextPath = '/registration/personalData';
    } else {
      if (!accessStatus.isActive) {
        nextPath = '/inactive';
      }
    }
    console.log(nextPath);
    return nextPath;
  }

  @Post('/forgot-password')
  @UsePipes(ValidationPipe)
  async forgotPassword(@Body() data: { email: string }) {
    return await this.awsCognitoService.initiateForgotPassword(data.email);
  }

  @Post('/reset-password')
  @UsePipes(ValidationPipe)
  async resetPassword(
    @Body() data: { email: string; code: string; newPassword: string },
  ) {
    return await this.awsCognitoService.confirmForgotPassword(
      data.email,
      data.code,
      data.newPassword,
    );
  }
}
