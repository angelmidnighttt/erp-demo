import { PasswordHash } from '../value-objects/password-hash.vo';

/**
 * PORT (cổng) = một INTERFACE mô tả "tôi cần một thứ làm được việc này",
 * nhưng KHÔNG nói làm bằng cách nào.
 *
 * Domain cần "băm mật khẩu" và "so khớp mật khẩu", nhưng KHÔNG quan tâm
 * dùng bcrypt, argon2 hay crypto. Đó là chi tiết của infrastructure.
 *
 * => Domain định nghĩa interface (cổng), infrastructure cắm "phích" vào
 *    bằng một class hiện thực (adapter). Đây chính là Dependency Inversion:
 *    tầng trong định nghĩa luật chơi, tầng ngoài tuân theo.
 */
export interface PasswordHasher {
  /** Băm mật khẩu thô thành PasswordHash. */
  hash(plain: string): Promise<PasswordHash>;

  /** Kiểm tra mật khẩu thô có khớp với hash đã lưu không. */
  compare(plain: string, hash: PasswordHash): Promise<boolean>;
}

/**
 * Token để NestJS biết phải tiêm (inject) hiện thực nào cho interface trên.
 * (Interface trong TypeScript biến mất lúc chạy, nên cần token làm "khoá" DI.)
 */
export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');
