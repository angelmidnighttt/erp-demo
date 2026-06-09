/**
 * "Record" = hình dạng dữ liệu khi LƯU TRỮ (giống một row trong bảng DB).
 *
 * Cố ý TÁCH BIỆT với entity domain (User). Vì:
 * - Domain dùng Value Object (Email, PasswordHash) còn DB chỉ lưu string.
 * - Cấu trúc DB có thể đổi (thêm cột, đổi tên) mà không động tới domain.
 *
 * Repository sẽ làm nhiệm vụ chuyển đổi: User (domain) <-> UserRecord (DB).
 */
export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}
