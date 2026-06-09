import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../../../../shared/kernel/domain.exception';

/**
 * FILTER = nơi DỊCH lỗi nghiệp vụ (DomainException) sang lỗi HTTP.
 *
 * Nhờ filter này, tầng domain/application có thể `throw` lỗi nghiệp vụ thuần
 * mà KHÔNG cần biết gì về HTTP. Toàn bộ ánh xạ "code nghiệp vụ -> status code"
 * tập trung ở một chỗ duy nhất tại biên (tầng api).
 */
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  // Bảng ánh xạ code nghiệp vụ -> HTTP status.
  private readonly statusByCode: Record<string, number> = {
    EMAIL_INVALID: HttpStatus.BAD_REQUEST,
    PASSWORD_WEAK: HttpStatus.BAD_REQUEST,
    EMAIL_ALREADY_USED: HttpStatus.CONFLICT,
    INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
  };

  catch(exception: DomainException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      this.statusByCode[exception.code] ?? HttpStatus.UNPROCESSABLE_ENTITY;

    response.status(status).json({
      code: exception.code,
      message: exception.message,
    });
  }
}
