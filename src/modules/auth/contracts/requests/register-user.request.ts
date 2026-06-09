/**
 * REQUEST = hình dạng dữ liệu CLIENT GỬI LÊN cho API đăng ký.
 *
 * Contracts chỉ là kiểu dữ liệu thuần (DTO), KHÔNG chứa logic nghiệp vụ.
 * Đây là "hợp đồng" giữa thế giới bên ngoài và hệ thống của ta.
 *
 * (Trong dự án thật thường gắn thêm decorator của class-validator như
 *  @IsEmail(), @MinLength(8) để validate ở biên. Ở đây để gọn, ta để domain
 *  VO tự validate.)
 */
export class RegisterUserRequest {
  email: string;
  password: string;
}
