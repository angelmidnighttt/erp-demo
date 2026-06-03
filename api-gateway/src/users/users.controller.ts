import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

/**
 * Protected user routes. Every request must carry a valid Bearer token,
 * which JwtAuthGuard verifies (via auth-service) before we proxy to
 * the user-service.
 */
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  private readonly userServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.userServiceUrl = this.config.get<string>(
      'USER_SERVICE_URL',
      'http://localhost:3002',
    );
  }

  /** Returns the profile of the currently authenticated user (from the token). */
  @Get('me')
  me(@Req() req: Request) {
    return (req as any).user;
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.proxyGet('/users', req);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.proxyGet(`/users/${id}`, req);
  }

  private async proxyGet(path: string, req: Request) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.userServiceUrl}${path}`, {
          // Forward the authenticated identity downstream.
          headers: {
            'x-user-id': String((req as any).user?.sub ?? ''),
            'x-user-roles': ((req as any).user?.roles ?? []).join(','),
          },
        }),
      );
      return response.data;
    } catch (err:any) {
      const status = err.response?.status ?? HttpStatus.BAD_GATEWAY;
      const message = err.response?.data?.message ?? 'Upstream error';
      throw new HttpException(message, status);
    }
  }
}
