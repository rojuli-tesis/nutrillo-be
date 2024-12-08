import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { UserService } from 'src/user/user.service';
import { AdminService } from 'src/admin/admin.service';
import { InviteService } from '../invite/invite.service';

@Injectable()
export class AwsCognitoService {
  private userPool: CognitoUserPool;

  constructor(
    // inject service,
    private userService: UserService,
    private adminService: AdminService,
    private inviteService: InviteService,
  ) {
    this.userPool = new CognitoUserPool({
      UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      ClientId: process.env.AWS_COGNITO_CLIENT_ID,
    });
  }

  async registerAdmin(authRegisterUserDto: SignUpDto) {
    const { firstName, lastName, email, password } = authRegisterUserDto;

    return new Promise((resolve, reject) => {
      this.userPool.signUp(
        email,
        password,
        [
          new CognitoUserAttribute({
            Name: 'given_name',
            Value: firstName,
          }),
          new CognitoUserAttribute({
            Name: 'family_name',
            Value: lastName,
          }),
        ],
        null,
        (err, result) => {
          if (!result) {
            reject(err);
          } else {
            this.adminService.create(result.userSub, {
              email,
              firstName,
              lastName,
            });
            resolve(result.user);
          }
        },
      );
    });
  }

  async registerUser(authRegisterUserDto: SignUpDto) {
    const { firstName, lastName, email, password, inviteCode } =
      authRegisterUserDto;

    // Check valid invite and accept it
    const invite = await this.inviteService.getInviteWithCode(inviteCode);
    await this.inviteService.acceptInvite(invite.id);

    return new Promise((resolve, reject) => {
      this.userPool.signUp(
        email,
        password,
        [
          new CognitoUserAttribute({
            Name: 'given_name',
            Value: firstName,
          }),
          new CognitoUserAttribute({
            Name: 'family_name',
            Value: lastName,
          }),
        ],
        null,
        (err, result) => {
          if (!result) {
            reject(err);
          } else {
            this.userService.create(result.userSub, {
              email,
              firstName,
              lastName,
              admin: invite.admin,
            });

            resolve(result.user);
          }
        },
      );
    });
  }

  async authenticateUser(authLoginUserDto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    userId: string;
  }> {
    const { email, password } = authLoginUserDto;
    const userData = {
      Username: email,
      Pool: this.userPool,
    };

    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const userCognito = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      userCognito.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          resolve({
            accessToken: result.getAccessToken().getJwtToken(),
            refreshToken: result.getRefreshToken().getToken(),
            userId: result.getIdToken().payload.sub,
          });
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  async authenticateAdmin(authLoginUserDto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password } = authLoginUserDto;
    const userData = {
      Username: email,
      Pool: this.userPool,
    };

    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const userCognito = new CognitoUser(userData);

    try {
      return new Promise((resolve, reject) => {
        userCognito.authenticateUser(authenticationDetails, {
          onSuccess: async (result) => {
            const cognitoId = result.getIdToken().payload.sub;
            const adminIsValid =
              await this.adminService.checkAdminByCognitoId(cognitoId);
            if (!adminIsValid) {
              reject({ message: 'Usuario no es administrador' });
            } else {
              resolve({
                accessToken: result.getAccessToken().getJwtToken(),
                refreshToken: result.getRefreshToken().getToken(),
              });
            }
          },
          onFailure: (err) => {
            reject({ message: 'Email o contraseña incorrectos' });
          },
        });
      });
    } catch (e) {
      console.error(e);
      throw UnauthorizedException;
    }
  }

  async initiateForgotPassword(email: string) {
    return new Promise((resolve, reject) => {
      const userData = {
        Username: email,
        Pool: this.userPool,
      };
      const cognitoUser = new CognitoUser(userData);
      cognitoUser.forgotPassword({
        onSuccess: () => {
          resolve({
            message: 'Se envió un correo con las instrucciones',
          });
        },
        onFailure: (err) => {
          reject({ message: err });
        },
      });
    });
  }

  async confirmForgotPassword(
    email: string,
    code: string,
    newPassword: string,
  ) {
    return new Promise((resolve, reject) => {
      const userData = {
        Username: email,
        Pool: this.userPool,
      };
      const cognitoUser = new CognitoUser(userData);
      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => {
          resolve({
            message: 'Contraseña actualizada',
          });
        },
        onFailure: (err) => {
          reject({ message: err });
        },
      });
    });
  }
}
