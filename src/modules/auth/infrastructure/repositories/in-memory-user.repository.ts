import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo';
import { UserRecord } from '../persistence/user.record';

/**
 * ADAPTER hiện thực UserRepository bằng một Map trong RAM.
 *
 * Đây là "phích cắm" vào cổng UserRepository. Trong dự án thật, bạn thay
 * file này bằng TypeOrmUserRepository / PrismaUserRepository... mà KHÔNG
 * phải sửa một dòng nào ở domain hay application. Đó là toàn bộ lợi ích
 * của việc đảo ngược phụ thuộc (Dependency Inversion).
 *
 * Chú ý hai hàm private toRecord/toDomain: đây là chỗ chuyển đổi giữa
 * thế giới DB (string) và thế giới domain (Value Object).
 */
@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private readonly store = new Map<string, UserRecord>();

  async save(user: User): Promise<void> {
    this.store.set(user.id, this.toRecord(user));
  }

  async findByEmail(email: Email): Promise<User | null> {
    for (const record of this.store.values()) {
      if (record.email === email.value) {
        return this.toDomain(record);
      }
    }
    return null;
  }

  async findById(id: string): Promise<User | null> {
    const record = this.store.get(id);
    return record ? this.toDomain(record) : null;
  }

  // ----- chuyển đổi domain <-> persistence -----

  private toRecord(user: User): UserRecord {
    return {
      id: user.id,
      email: user.email.value,
      passwordHash: user.passwordHash.value,
      createdAt: user.createdAt.toISOString(),
    };
  }

  private toDomain(record: UserRecord): User {
    return User.rehydrate({
      id: record.id,
      email: Email.create(record.email),
      passwordHash: PasswordHash.fromHashed(record.passwordHash),
      createdAt: new Date(record.createdAt),
    });
  }
}
