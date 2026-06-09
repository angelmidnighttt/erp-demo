/**
 * DomainException = lỗi phát sinh từ VI PHẠM QUY TẮC NGHIỆP VỤ.
 *
 * Quan trọng: tầng domain KHÔNG được biết gì về HTTP (status code 400, 409...).
 * Nó chỉ "ném" lỗi nghiệp vụ thuần tuý kèm một `code` để định danh.
 * Việc dịch lỗi này thành HTTP response là nhiệm vụ của tầng api (filter).
 *
 * `code` ví dụ: 'EMAIL_INVALID', 'EMAIL_ALREADY_USED', 'INVALID_CREDENTIALS'.
 */
export class DomainException extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'DomainException';
  }
}
