import { DomainEvent } from '../../../../shared/domain/domain-event';

/**
 * Sự kiện: "Một người dùng vừa đăng ký thành công."
 *
 * Phát ra event này thay vì gọi thẳng (ví dụ) EmailService giúp domain
 * KHÔNG phụ thuộc vào việc-gửi-mail. Sau này muốn thêm "tặng điểm thưởng",
 * "ghi log audit"... chỉ cần thêm handler lắng nghe event, không sửa domain.
 */
export class UserRegisteredEvent extends DomainEvent {
  constructor(
    readonly userId: string,
    readonly email: string,
  ) {
    super();
  }

  eventName(): string {
    return 'auth.user-registered';
  }
}
