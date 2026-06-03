import { IsString, IsNotEmpty } from 'class-validator';

export class ValidateCredentialsDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
