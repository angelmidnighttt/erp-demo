import { DomainEvent } from './domain-event';

/**
 * Aggregate Root = "người gác cổng" của một cụm object nghiệp vụ.
 *
 * - Mọi thay đổi vào cụm đó PHẢI đi qua aggregate root => nó đảm bảo
 *   các quy tắc nghiệp vụ (invariants) luôn đúng.
 * - Aggregate root có một định danh (id) duy nhất.
 * - Nó tích luỹ các domain event xảy ra trong quá trình xử lý, để tầng
 *   application "lấy ra" và phát đi sau khi lưu thành công.
 *
 * <TId> = kiểu của id (ở đây ta dùng string/uuid).
 */
export abstract class AggregateRoot<TId> {
  protected readonly _id: TId;

  /** Hàng đợi event chưa được phát ra ngoài. */
  private _domainEvents: DomainEvent[] = [];

  protected constructor(id: TId) {
    this._id = id;
  }

  get id(): TId {
    return this._id;
  }

  /** Aggregate gọi hàm này khi có việc nghiệp vụ đáng ghi nhận xảy ra. */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /** Tầng application lấy danh sách event ra rồi xoá hàng đợi (đã xử lý). */
  pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }
}
