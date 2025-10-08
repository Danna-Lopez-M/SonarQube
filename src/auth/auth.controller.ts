import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { GetUser } from './decorators/get-user/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { Auth } from './decorators/auth.decorator';
import { ValidRoles } from './interfaces/valid-roles';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-auth-status')
  @Auth(ValidRoles.client, ValidRoles.admin, ValidRoles.salesperson)
  checkAuthStatus(@GetUser() user: User) {
    return {
      user,
      message: 'User is authenticated',
    };
  }

  @Get('admin-dashboard')
  @Auth(ValidRoles.admin)
  adminDashboard(@GetUser() user: User) {
    return {
      user,
      message: 'You have access to admin dashboard'
    };
  }

  @Get('sales-dashboard')
  @Auth(ValidRoles.salesperson)
  salesDashboard(@GetUser() user: User) {
    return {
      user,
      message: 'You have access to sales dashboard'
    };
  }
}