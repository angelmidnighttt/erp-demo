import { DomainException } from '../../../../shared/kernel/domain.exception';

/**
 * Các lỗi nghiệp vụ riêng của bounded context Auth.
 * Mỗi lỗi là một loại DomainException với `code` định danh rõ ràng.
 *
 * Lợi ích của việc tạo class riêng (thay vì throw chuỗi lung tung):
 * - Gọi ngắn gọn, nhất quán: `throw new EmailAlreadyUsedError(email)`
 * - Tầng api dễ map sang HTTP status dựa vào `code`.
 */

export class InvalidEmailError extends DomainException {
  constructor(value: string) {
    super('EMAIL_INVALID', `Email không hợp lệ: "${value}".`);
  }
}

export class WeakPasswordError extends DomainException {
  constructor() {
    super('PASSWORD_WEAK', 'Mật khẩu phải có ít nhất 8 ký tự.');
  }
}

export class EmailAlreadyUsedError extends DomainException {
  constructor(email: string) {
    super('EMAIL_ALREADY_USED', `Email "${email}" đã được sử dụng.`);
  }
}

export class InvalidCredentialsError extends DomainException {
  constructor() {
    super('INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng.');
  }
}
