import { Injectable } from '@nestjs/common';
import { createHmac } from 'node:crypto';
import { TokenGenerator } from '../../application/ports/token-generator';
import { User } from '../../domain/entities/user.entity';

/**
 * ADAPTER sinh token đơn giản theo kiểu JWT thủ công (header.payload.signature),
 * ký bằng HMAC-SHA256. Mục đích DEMO để khỏi cài @nestjs/jwt.
 *
 * Trong dự án thật: thay bằng JwtService của @nestjs/jwt, đọc secret từ config.
 * Domain/application KHÔNG đổi vì chúng chỉ phụ thuộc interface TokenGenerator.
 */
@Injectable()
export class HmacTokenGenerator implements TokenGenerator {
  // DEMO: secret hardcode. Thật thì lấy từ biến môi trường / config.
  private readonly secret = 'demo-secret-doi-trong-thuc-te';

  async generate(user: User): Promise<string> {
    const header = this.base64url({ alg: 'HS256', typ: 'JWT' });
    const payload = this.base64url({
      sub: user.id,
      email: user.email.value,
    });
    const signature = createHmac('sha256', this.secret)
      .update(`${header}.${payload}`)
      .digest('base64url');
    return `${header}.${payload}.${signature}`;
  }

  private base64url(obj: unknown): string {
    return Buffer.from(JSON.stringify(obj)).toString('base64url');
  }
}
