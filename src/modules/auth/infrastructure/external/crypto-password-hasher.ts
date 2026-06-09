import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { PasswordHasher } from '../../domain/services/password-hasher';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo';

const scrypt = promisify(scryptCb);

/**
 * ADAPTER hiện thực PasswordHasher bằng `scrypt` của Node (không cần cài thêm).
 *
 * Định dạng hash lưu lại: "<salt_hex>:<hash_hex>".
 * Trong dự án thật bạn thường thay bằng bcrypt/argon2 — chỉ cần đổi file này.
 */
@Injectable()
export class CryptoPasswordHasher implements PasswordHasher {
  private readonly keyLen = 64;

  async hash(plain: string): Promise<PasswordHash> {
    const salt = randomBytes(16).toString('hex');
    const derived = (await scrypt(plain, salt, this.keyLen)) as Buffer;
    return PasswordHash.fromHashed(`${salt}:${derived.toString('hex')}`);
  }

  async compare(plain: string, hash: PasswordHash): Promise<boolean> {
    const [salt, key] = hash.value.split(':');
    if (!salt || !key) return false;

    const derived = (await scrypt(plain, salt, this.keyLen)) as Buffer;
    const keyBuffer = Buffer.from(key, 'hex');

    // So sánh chống tấn công đo thời gian (timing attack).
    if (keyBuffer.length !== derived.length) return false;
    return timingSafeEqual(keyBuffer, derived);
  }
}
