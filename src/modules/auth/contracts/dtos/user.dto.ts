/**
 * DTO mô tả User khi TRẢ RA ngoài.
 *
 * Cố ý KHÔNG có passwordHash — ta không bao giờ để lộ thông tin nhạy cảm
 * ra API. DTO là "bản đã lọc" của entity domain.
 */
export class UserDto {
  id: string;
  email: string;
  createdAt: string;
}
