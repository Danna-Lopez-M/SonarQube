import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('JwtAuthGuard - canActivate');
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    console.log('JwtAuthGuard - handleRequest');
    console.log('Error:', err);
    console.log('User:', user);
    console.log('Info:', info);
    if (err || !user) {
      console.error('Error de autenticación:', info?.message);
      throw new UnauthorizedException(info?.message || 'Invalid token');
    }

    if (!user.roles || !Array.isArray(user.roles)) {
      console.error('Usuario sin roles válidos');
      throw new UnauthorizedException('User has no valid roles');
    }

    return user;
  }
}