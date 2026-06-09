import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';

/**
 * PORT cho việc lưu trữ User.
 *
 * Domain nói: "Tôi cần lưu/tìm User", nhưng KHÔNG quan tâm lưu vào
 * Postgres, MongoDB hay mảng trong RAM. Interface này là hợp đồng;
 * infrastructure sẽ cung cấp hiện thực cụ thể.
 *
 * Quan trọng: interface này làm việc với ĐỐI TƯỢNG DOMAIN (User, Email),
 * KHÔNG phải với row/table của DB. Nhờ vậy domain hoàn toàn sạch khỏi DB.
 */
export interface UserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: Email): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}

/** Token DI cho hiện thực của UserRepository. */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
