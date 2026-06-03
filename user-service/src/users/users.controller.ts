import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ValidateCredentialsDto } from './dto/validate-credentials.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * Internal endpoint used by auth-service to verify a login.
   * Returns { valid: boolean, user?: SafeUser }.
   */
  @Post('validate-credentials')
  async validateCredentials(@Body() dto: ValidateCredentialsDto) {
    const user = await this.usersService.validateCredentials(
      dto.username,
      dto.password,
    );
    return { valid: !!user, user: user ?? null };
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }
}
