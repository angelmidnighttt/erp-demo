import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IdentityService } from './identity.service';

export interface JwtPayload {
  sub: number; // user id
  username: string;
  roles: string[];
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly identityService: IdentityService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Verify credentials against the local identity store, then sign and
   * return a JWT. (In production the identity check would be an SSO exchange.)
   */
  async login(username: string, password: string) {
    const user = await this.identityService.validateCredentials(
      username,
      password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      roles: user.roles,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: this.config.get<string>('JWT_EXPIRES_IN', '3600s'),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  /**
   * Verify a JWT. Returns { valid, payload } — used by the api-gateway guard.
   */
  async validateToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      return { valid: true, payload };
    } catch (err: any) {
      this.logger.warn(`Token validation failed: ${err.message}`);
      return { valid: false, payload: null };
    }
  }
}
