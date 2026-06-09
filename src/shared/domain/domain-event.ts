/**
 * Domain Event = "một việc có ý nghĩa nghiệp vụ vừa xảy ra trong quá khứ".
 * Ví dụ: UserRegistered (người dùng vừa đăng ký).
 *
 * Mục đích: cho phép các phần khác của hệ thống PHẢN ỨNG lại sự kiện
 * mà domain KHÔNG cần biết ai đang lắng nghe (giảm phụ thuộc).
 *
 * Đây là lớp cha, mọi event cụ thể sẽ kế thừa nó.
 */
export abstract class DomainEvent {
  /** Thời điểm sự kiện xảy ra. */
  readonly occurredAt: Date;

  constructor() {
    this.occurredAt = new Date();
  }

  /** Tên định danh của loại sự kiện, dùng để route handler. */
  abstract eventName(): string;
}
