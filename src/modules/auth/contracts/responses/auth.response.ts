import { UserDto } from '../dtos/user.dto';

/** Kết quả trả về sau khi đăng nhập / đăng ký thành công. */
export class AuthResponse {
  accessToken: string;
  user: UserDto;
}
