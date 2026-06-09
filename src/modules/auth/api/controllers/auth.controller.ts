import { Body, Controller, Post, UseFilters } from '@nestjs/common';
import { RegisterUserHandler } from '../../application/commands/register-user.handler';
import { RegisterUserCommand } from '../../application/commands/register-user.command';
import { LoginHandler } from '../../application/commands/login.handler';
import { LoginCommand } from '../../application/commands/login.command';
import { RegisterUserRequest } from '../../contracts/requests/register-user.request';
import { LoginRequest } from '../../contracts/requests/login.request';
import { AuthResponse } from '../../contracts/responses/auth.response';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';

/**
 * CONTROLLER thuộc tầng api — phải GIỮ THẬT MỎNG.
 *
 * Nhiệm vụ duy nhất: nhận HTTP request -> dựng Command -> gọi handler
 * (use case) -> trả về response. TUYỆT ĐỐI không nhét logic nghiệp vụ ở đây.
 *
 * Nếu một ngày bạn đổi từ REST sang GraphQL/gRPC, bạn chỉ viết lại tầng api;
 * application + domain giữ nguyên.
 */
@Controller('auth')
@UseFilters(DomainExceptionFilter)
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserHandler,
    private readonly login: LoginHandler,
  ) {}

  @Post('register')
  register(@Body() body: RegisterUserRequest): Promise<AuthResponse> {
    return this.registerUser.execute(
      new RegisterUserCommand(body.email, body.password),
    );
  }

  @Post('login')
  signIn(@Body() body: LoginRequest): Promise<AuthResponse> {
    return this.login.execute(new LoginCommand(body.email, body.password));
  }
}
