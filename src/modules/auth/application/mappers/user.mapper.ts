import { User } from '../../domain/entities/user.entity';
import { UserDto } from '../../contracts/dtos/user.dto';

/**
 * MAPPER = bộ chuyển đổi giữa các tầng.
 *
 * Ở đây: từ ENTITY domain (User) -> DTO contract (UserDto) để trả ra API.
 * Tách riêng việc này giúp domain không "rò rỉ" ra ngoài, và ta chủ động
 * chọn lọc field nào được lộ (ví dụ: bỏ passwordHash).
 */
export class UserMapper {
  static toDto(user: User): UserDto {
    return {
      id: user.id,
      email: user.email.value,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
