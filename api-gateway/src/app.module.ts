import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';
import { JwtAuthGuard } from './common/jwt-auth.guard';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule],
  controllers: [AuthController, UsersController],
  providers: [JwtAuthGuard],
})
export class AppModule {}
