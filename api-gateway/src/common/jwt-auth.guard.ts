import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';

/**
 * Gateway-level guard. For any protected route it:
 *  1. Pulls the Bearer token off the Authorization header.
 *  2. Asks the auth-service to validate it (token introspection).
 *  3. Attaches the decoded payload to req.user so controllers can forward it.
 *
 * This keeps the JWT secret in the auth-service only — the gateway never
 * needs to know how to verify tokens itself.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private readonly authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.authServiceUrl = this.config.get<string>(
      'AUTH_SERVICE_URL',
      'http://localhost:3001',
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    let result: { valid: boolean; payload: any };
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/validate`, {
          token,
        }),
      );
      result = response.data;
    } catch (err:any) {
      this.logger.error(`auth-service unreachable: ${err.message}`);
      throw new UnauthorizedException('Auth service unavailable');
    }

    if (!result.valid) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Make the authenticated user available to downstream handlers.
    (request as any).user = result.payload;
    return true;
  }

  private extractToken(request: Request): string | null {
    const auth = request.headers['authorization'];
    if (!auth) return null;
    const [type, token] = auth.split(' ');
    return type === 'Bearer' && token ? token : null;
  }
}
