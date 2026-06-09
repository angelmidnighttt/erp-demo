import { Module } from '@nestjs/common';

// api
import { AuthController } from './api/controllers/auth.controller';
// application
import { RegisterUserHandler } from './application/commands/register-user.handler';
import { LoginHandler } from './application/commands/login.handler';
import { TOKEN_GENERATOR } from './application/ports/token-generator';
// domain (ports/tokens)
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { PASSWORD_HASHER } from './domain/services/password-hasher';
// infrastructure (adapters/hiện thực)
import { InMemoryUserRepository } from './infrastructure/repositories/in-memory-user.repository';
import { CryptoPasswordHasher } from './infrastructure/external/crypto-password-hasher';
import { HmacTokenGenerator } from './infrastructure/external/hmac-token-generator';

/**
 * AuthModule = nơi LẮP RÁP toàn bộ module (Composition Root của bounded context).
 *
 * Đây là chỗ DUY NHẤT biết "interface nào dùng hiện thực nào". Cú pháp
 * { provide: TOKEN, useClass: Adapter } nghĩa là: hễ ai inject TOKEN
 * (tức inject port), NestJS sẽ đưa cho họ instance của Adapter.
 *
 * Muốn đổi sang DB thật? Chỉ sửa useClass ở đây:
 *   { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository }
 * => không file nào ở domain/application phải đổi.
 */
@Module({
  controllers: [AuthController],
  providers: [
    // Use cases (tầng application)
    RegisterUserHandler,
    LoginHandler,

    // Gắn PORT -> ADAPTER (đảo ngược phụ thuộc)
    { provide: USER_REPOSITORY, useClass: InMemoryUserRepository },
    { provide: PASSWORD_HASHER, useClass: CryptoPasswordHasher },
    { provide: TOKEN_GENERATOR, useClass: HmacTokenGenerator },
  ],
})
export class AuthModule {}
