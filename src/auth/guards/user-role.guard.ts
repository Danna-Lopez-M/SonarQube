import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ValidRoles } from '../interfaces/valid-roles';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const validRoles: ValidRoles[] = this.reflector.get<ValidRoles[]>('roles', context.getHandler());
    
    if (!validRoles || validRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    console.log('Roles requeridos:', validRoles);
    console.log('Roles del usuario:', user.roles);

    const hasValidRole = user.roles.some(role => validRoles.includes(role as ValidRoles));
    
    if (!hasValidRole) {
      throw new ForbiddenException(
        `User ${user.fullName} need a valid role: [${validRoles}]`
      );
    }

    return true;
  }
} 