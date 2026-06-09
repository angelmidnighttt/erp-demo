/**
 * COMMAND = "ý định thực hiện một thao tác GHI", đóng gói dữ liệu đầu vào
 * cần thiết cho use case. Nó là object thuần, không logic.
 *
 * Phân biệt với Request (contracts): Request là dữ liệu THÔ ở biên HTTP;
 * Command là đầu vào ĐÃ ĐƯỢC LÀM SẠCH mà tầng application làm việc cùng.
 * Ở demo nhỏ chúng gần giống nhau, nhưng tách ra để mỗi tầng độc lập.
 */
export class RegisterUserCommand {
  constructor(
    readonly email: string,
    readonly password: string,
  ) {}
}
