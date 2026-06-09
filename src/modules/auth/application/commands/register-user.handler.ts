import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';
import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from '../../domain/services/password-hasher';
import {
  TOKEN_GENERATOR,
  type TokenGenerator,
} from '../ports/token-generator';
import { Email } from '../../domain/value-objects/email.vo';
import { User } from '../../domain/entities/user.entity';
import { EmailAlreadyUsedError, WeakPasswordError } from '../../domain/errors/auth.errors';
import { UserMapper } from '../mappers/user.mapper';
import { AuthResponse } from '../../contracts/responses/auth.response';
import { RegisterUserCommand } from './register-user.command';

/**
 * HANDLER (use case) = bộ ĐIỀU PHỐI một kịch bản nghiệp vụ.
 *
 * Vai trò của tầng application: dàn xếp các bước, KHÔNG tự chứa quy tắc
 * nghiệp vụ (quy tắc nằm trong domain). Nó giống "nhạc trưởng":
 *
 *   1. Biến dữ liệu thô thành Value Object của domain (Email tự validate).
 *   2. Kiểm tra điều kiện cần qua repository (email đã tồn tại chưa?).
 *   3. Nhờ port (hasher) làm việc kỹ thuật (băm mật khẩu).
 *   4. Gọi factory của domain để tạo aggregate (User.register) — domain
 *      tự sinh ra event bên trong.
 *   5. Lưu qua repository.
 *   6. (Tuỳ chọn) phát các domain event đã tích luỹ.
 *   7. Trả về DTO cho tầng trên.
 *
 * Chú ý các `@Inject(TOKEN)`: ta tiêm INTERFACE (port) qua token, nên handler
 * KHÔNG biết hiện thực cụ thể là gì => dễ thay thế, dễ test.
 */
@Injectable()
export class RegisterUserHandler {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(TOKEN_GENERATOR) private readonly tokens: TokenGenerator,
  ) {}

  async execute(command: RegisterUserCommand): Promise<AuthResponse> {
    // (1) Thô -> VO. Nếu email sai định dạng, Email.create tự ném lỗi domain.
    const email = Email.create(command.email);

    // Một quy tắc đơn giản kiểm tra ở application; quy tắc "thuộc về" giá trị
    // mật khẩu nên cũng có thể đưa vào một VO Password riêng — ở đây để gọn.
    if (command.password.length < 8) {
      throw new WeakPasswordError();
    }

    // (2) Bất biến nghiệp vụ: email là duy nhất.
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new EmailAlreadyUsedError(email.value);
    }

    // (3) Nhờ port băm mật khẩu (không quan tâm thuật toán).
    const passwordHash = await this.hasher.hash(command.password);

    // (4) Domain tạo aggregate + tự phát event UserRegistered.
    const user = User.register(email, passwordHash);

    // (5) Lưu lại.
    await this.users.save(user);

    // (6) Lấy event ra để phát đi (ở demo ta chỉ "rút" cho đúng vòng đời;
    //     nơi phát thật sự sẽ là một event bus — xem ghi chú trong README).
    user.pullDomainEvents();

    // (7) Sinh token và trả DTO ra ngoài.
    const accessToken = await this.tokens.generate(user);
    return { accessToken, user: UserMapper.toDto(user) };
  }
}
