import { randomUUID } from 'node:crypto';
import { AggregateRoot } from '../../../../shared/domain/aggregate-root';
import { Email } from '../value-objects/email.vo';
import { PasswordHash } from '../value-objects/password-hash.vo';
import { UserRegisteredEvent } from '../events/user-registered.event';

/**
 * User = AGGREGATE ROOT của bounded context Auth.
 *
 * Đây là nơi tập trung HÀNH VI nghiệp vụ liên quan tới người dùng.
 * Triết lý DDD: "rich domain model" — object nghiệp vụ chứa cả DỮ LIỆU lẫn
 * HÀNH VI, thay vì chỉ là một túi dữ liệu rỗng (anemic model) với getter/setter.
 *
 * Chú ý cách thiết kế:
 * - Các field là `private` + `readonly` chỗ nào có thể => bảo vệ trạng thái.
 * - Không có constructor public. Muốn tạo User phải qua factory `register`,
 *   nơi các quy tắc nghiệp vụ được áp dụng và event được phát ra.
 * - Muốn tái tạo User từ DB thì dùng `rehydrate` (không phát event, vì đây
 *   không phải việc nghiệp vụ mới — chỉ là load lại trạng thái cũ).
 */
export class User extends AggregateRoot<string> {
  private constructor(
    id: string,
    private readonly _email: Email,
    private _passwordHash: PasswordHash,
    private readonly _createdAt: Date,
  ) {
    super(id);
  }

  get email(): Email {
    return this._email;
  }

  get passwordHash(): PasswordHash {
    return this._passwordHash;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * FACTORY tạo người dùng MỚI (use case "đăng ký").
   * Nhận vào hash đã được tính sẵn — vì việc băm là trách nhiệm của
   * application/infrastructure, không phải của entity.
   * Đây là nơi sinh ra domain event UserRegistered.
   */
  static register(email: Email, passwordHash: PasswordHash): User {
    const user = new User(randomUUID(), email, passwordHash, new Date());
    user.addDomainEvent(new UserRegisteredEvent(user.id, email.value));
    return user;
  }

  /**
   * Tái dựng User từ dữ liệu đã lưu (DB). KHÔNG phát event.
   * Repository sẽ gọi hàm này khi đọc dữ liệu lên.
   */
  static rehydrate(props: {
    id: string;
    email: Email;
    passwordHash: PasswordHash;
    createdAt: Date;
  }): User {
    return new User(props.id, props.email, props.passwordHash, props.createdAt);
  }

  /** Đổi mật khẩu — một hành vi nghiệp vụ nằm ngay trong aggregate. */
  changePassword(newHash: PasswordHash): void {
    this._passwordHash = newHash;
  }
}
