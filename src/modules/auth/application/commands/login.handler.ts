import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';
import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from '../../domain/services/password-hasher';
import { TOKEN_GENERATOR, type TokenGenerator } from '../ports/token-generator';
import { Email } from '../../domain/value-objects/email.vo';
import { InvalidCredentialsError } from '../../domain/errors/auth.errors';
import { UserMapper } from '../mappers/user.mapper';
import { AuthResponse } from '../../contracts/responses/auth.response';
import { LoginCommand } from './login.command';

/**
 * Use case ĐĂNG NHẬP.
 *
 * Lưu ý bảo mật nghiệp vụ: dù sai email hay sai mật khẩu, ta đều trả về
 * CÙNG một lỗi InvalidCredentials — tránh để kẻ tấn công dò xem email nào
 * đã tồn tại trong hệ thống.
 */
@Injectable()
export class LoginHandler {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(TOKEN_GENERATOR) private readonly tokens: TokenGenerator,
  ) {}

  async execute(command: LoginCommand): Promise<AuthResponse> {
    const email = Email.create(command.email);

    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const matches = await this.hasher.compare(
      command.password,
      user.passwordHash,
    );
    if (!matches) {
      throw new InvalidCredentialsError();
    }

    const accessToken = await this.tokens.generate(user);
    return { accessToken, user: UserMapper.toDto(user) };
  }
}
