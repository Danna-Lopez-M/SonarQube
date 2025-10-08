import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { UserRoleGuard } from './auth/guards/user-role.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should handleRequest: throw if error or no user', () => {
    expect(() => (guard as any).handleRequest(new Error('fail'), null, null)).toThrow();
    expect(() => (guard as any).handleRequest(null, null, { message: 'fail' })).toThrow();
  });
});

describe('UserRoleGuard', () => {
  let guard: UserRoleGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new UserRoleGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });


  it('should allow access if user has required role', () => {
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { roles: ['admin'] },
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    };
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    expect(guard.canActivate(mockContext as ExecutionContext)).toBe(true);
  });

  
});

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(() => {
    service = { getHello: jest.fn().mockReturnValue('Hello World!') } as any;
    controller = new AppController(service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return hello message', () => {
    expect(controller.getHello()).toBe('Hello World!');
    expect(service.getHello).toHaveBeenCalled();
  });
});