import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  ISignUpResult,
} from 'amazon-cognito-identity-js';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { UserService } from '../user/user.service';
import { AdminService } from '../admin/admin.service';
import { InviteService } from '../invite/invite.service';

interface CognitoError extends Error {
  code?: string;
  name: string;
  message: string;
}

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

    try {
      const result = await new Promise<ISignUpResult>((resolve, reject) => {
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
          (err: CognitoError, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          },
        );
      });

      if (!result) {
        throw new Error('Error al crear el usuario en Cognito');
      }

      await this.adminService.create(result.userSub, {
        email,
        firstName,
        lastName,
      });

      return result.user;
    } catch (error: any) {
      // Handle specific AWS Cognito error codes
      let errorMessage = 'Error al registrar el administrador';
      
      if (error.code) {
        switch (error.code) {
          case 'UsernameExistsException':
            errorMessage = 'El correo electrónico ya está registrado';
            break;
          case 'InvalidPasswordException':
            errorMessage = 'La contraseña no cumple con los requisitos de seguridad';
            break;
          case 'InvalidParameterException':
            errorMessage = 'Los datos proporcionados no son válidos';
            break;
          case 'CodeMismatchException':
            errorMessage = 'El código de verificación no coincide';
            break;
          case 'ExpiredCodeException':
            errorMessage = 'El código de verificación ha expirado';
            break;
          default:
            console.error('AWS Cognito Error:', error);
            errorMessage = error.message || 'Error al registrar el administrador';
        }
      }

      // If admin creation failed, try to clean up the Cognito user
      if (error.message === 'Error al crear el administrador en la base de datos') {
        try {
          const cognitoUser = new CognitoUser({
            Username: email,
            Pool: this.userPool,
          });
          await new Promise((resolveDelete, rejectDelete) => {
            cognitoUser.deleteUser((deleteErr) => {
              if (deleteErr) {
                rejectDelete(deleteErr);
              } else {
                resolveDelete(true);
              }
            });
          });
        } catch (deleteError) {
          console.error('Error cleaning up Cognito user:', deleteError);
        }
      }

      throw new Error(errorMessage);
    }
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
