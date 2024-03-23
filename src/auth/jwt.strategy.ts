import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { UserService } from '../user/user.service';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UserService,
    private adminService: AdminService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req) => req.cookies['jwt']]),
      ignoreExpiration: false,
      _audience: process.env.AWS_COGNITO_COGNITO_CLIENT_ID,
      issuer: process.env.AWS_COGNITO_AUTHORITY,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.AWS_COGNITO_AUTHORITY + '/.well-known/jwks.json',
      }),
    });
  }

  async validate(payload: any) {
    // You can add additional validation logic here
    // If the token is not valid, throw an UnauthorizedException
    if (!payload) {
      throw new UnauthorizedException();
    }
    const admin = await this.adminService.findByCognitoId(payload.sub);
    const user = await this.userService.findByCognitoId(payload.sub);
    return {
      cognitoId: payload.sub,
      username: payload.username,
      isAdmin: !!admin,
      userId: admin ? admin.id : user.id,
    };
  }
}
