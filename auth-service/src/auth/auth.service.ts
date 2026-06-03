import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface JwtPayload {
  sub: number; // user id
  username: string;
  roles: string[];
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly userServiceUrl: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.userServiceUrl = this.config.get<string>(
      'USER_SERVICE_URL',
      'http://localhost:3002',
    );
  }

  /**
   * Verify credentials against user-service, then sign and return a JWT.
   */
  async login(username: string, password: string) {
    let data: { valid: boolean; user: any };
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.userServiceUrl}/users/validate-credentials`,
          { username, password },
        ),
      );
      data = response.data;
    } catch (err) {
      this.logger.error(`user-service unreachable: ${err.message}`);
      throw new UnauthorizedException('Authentication service unavailable');
    }

    if (!data.valid || !data.user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const user = data.user;
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
    } catch (err) {
      this.logger.warn(`Token validation failed: ${err.message}`);
      return { valid: false, payload: null };
    }
  }
}
