import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * Public auth routes. The gateway simply forwards them to the auth-service.
 * No guard here — login must be reachable without a token.
 */
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { username: string; password: string }) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/login`, body),
      );
      return response.data;
    } catch (err:any) {
      // Pass the upstream status/message through to the client.
      const status = err.response?.status ?? HttpStatus.BAD_GATEWAY;
      const message = err.response?.data?.message ?? 'Login failed';
      throw new HttpException(message, status);
    }
  }
}
