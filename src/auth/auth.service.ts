import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { RolesService } from '../roles/roles.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ValidRoles } from './interfaces/valid-roles';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    try {
      const defaultRole = await this.rolesService.findByName(ValidRoles.client);
      if (!defaultRole) {
        throw new InternalServerErrorException('Default role not found');
      }

      const user = await this.usersService.create({
        ...createUserDto,
        roles: [ValidRoles.client],
      });

      delete user.password;
      return {
        ...user,
        token: this.getJwtToken({ id: user.id, fullName: user.fullName , roles: user.roles }),
      };
    } catch (error) {
      throw error;
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    
    const user = await this.usersService.findByEmail(email, true);    
    
    if (!email || !password) {
      throw new BadRequestException('Email y contraseña son requeridos');
    }

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.password) {
      throw new InternalServerErrorException('La contraseña no está configurada para este usuario');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password: _, fullName, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      token: this.getJwtToken({ id: user.id, fullName: user.fullName, roles: user.roles }),
    };
  }

  // async login(loginUserDto: LoginUserDto) {
  //   const { email, password } = loginUserDto;

  //   if (!email || !password) {
  //     throw new BadRequestException('Email and password are required');
  //   }
  //   const user = await this.usersService.findByEmail(email);

  //   if (!user) {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }
    
  //   if (!user.isActive) {
  //     throw new UnauthorizedException('User is inactive, please contact an administrator');
  //   }

  //   if (!bcrypt.compareSync(password, user.password)) {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }

  //   //delete user.password;

  //   return {
  //     ...user,
  //     token: this.getJwtToken({ id: user.id, roles: user.roles }),
  //   };
  // }

  async validateUser(id: string): Promise<User> {
    const user = await this.usersService.findOne(id).catch(() => null);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    
    //delete user.password;
    return user;
  }


  private getJwtToken(payload: JwtPayload): string {
    return this.jwtService.sign({
      id: payload.id,
      fullName: payload.fullName,
      roles: payload.roles,
    });
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException('User already exists');
    }
    throw new InternalServerErrorException(error.code);
  }
}