/**
 * VO đại diện cho MẬT KHẨU ĐÃ MÃ HOÁ (hash), không bao giờ là mật khẩu thô.
 *
 * Tại sao tách riêng VO này?
 * - Để trong domain không bao giờ lỡ tay lưu/log mật khẩu thô.
 * - Khi cầm một `PasswordHash`, ta biết chắc đây là chuỗi đã hash an toàn.
 *
 * Lưu ý: VO này KHÔNG tự hash (vì hash là chi tiết kỹ thuật của infrastructure).
 * Nó chỉ "đựng" giá trị hash và biết cách so sánh. Việc hash thực tế do
 * cổng (port) PasswordHasher đảm nhiệm.
 */
export class PasswordHash {
  private constructor(public readonly value: string) {}

  /** Bọc một chuỗi đã hash sẵn (từ hasher hoặc từ DB load lên). */
  static fromHashed(hashed: string): PasswordHash {
    return new PasswordHash(hashed);
  }
}
