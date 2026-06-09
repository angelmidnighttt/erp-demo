import { InvalidEmailError } from '../errors/auth.errors';

/**
 * Value Object (VO) = đối tượng được định danh bằng GIÁ TRỊ, không có id riêng.
 * Hai Email cùng chuỗi thì coi như BẰNG NHAU.
 *
 * Đặc điểm cốt lõi của VO:
 * 1. BẤT BIẾN (immutable): tạo xong không sửa được (readonly).
 * 2. TỰ KIỂM TRA TÍNH HỢP LỆ: không thể tạo ra một Email sai định dạng.
 *    => Ở mọi nơi khác trong code, hễ cầm một `Email` là CHẮC CHẮN nó hợp lệ.
 *    Đây là sức mạnh của DDD: đẩy validation vào kiểu dữ liệu.
 */
export class Email {
  private static readonly PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // private constructor => bắt buộc tạo qua factory `create`, không `new` trực tiếp.
  private constructor(public readonly value: string) {}

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();
    if (!Email.PATTERN.test(normalized)) {
      throw new InvalidEmailError(raw);
    }
    return new Email(normalized);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
