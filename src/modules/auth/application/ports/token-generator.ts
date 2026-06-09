import { User } from '../../domain/entities/user.entity';

/**
 * PORT sinh access token (ví dụ JWT).
 *
 * Đặt ở tầng application (không phải domain) vì "token đăng nhập" là khái niệm
 * của tầng ứng dụng/bảo mật, không phải quy tắc nghiệp vụ cốt lõi của User.
 *
 * Cũng như các port khác: application định nghĩa interface, infrastructure
 * cắm hiện thực (HMAC, thư viện jwt...) vào.
 */
export interface TokenGenerator {
  generate(user: User): Promise<string>;
}

export const TOKEN_GENERATOR = Symbol('TOKEN_GENERATOR');
