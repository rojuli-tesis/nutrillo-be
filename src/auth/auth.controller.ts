import {
  Body,
  Controller,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AwsCognitoService } from './aws-cognito.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { UserService } from '../user/user.service';
import { JwtAuthGuard } from './jwt-auth.guard';

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
      } else {
        nextPath = '/home';
      }
    }
    console.log(nextPath);
    return nextPath;
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const user = await this.userService.getUserById(req.user.userId);
    return { userId: req.user.userId, firstName: user.firstName };
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
