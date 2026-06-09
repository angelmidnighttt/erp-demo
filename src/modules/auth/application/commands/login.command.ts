/** Đầu vào của use case đăng nhập. */
export class LoginCommand {
  constructor(
    readonly email: string,
    readonly password: string,
  ) {}
}
