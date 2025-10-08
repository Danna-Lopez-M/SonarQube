import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { User } from '../users/entities/user.entity';
import { ValidRoles } from './interfaces/valid-roles';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto: CreateUserDto = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        dni: '123456789',
        phone: '1234567890',
      };

      const expectedResponse = {
        id: '1',
        fullName: 'Test User',
        email: 'test@example.com',
        roles: [ValidRoles.client],
        token: 'jwt-token',
      };

      mockAuthService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(createUserDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResponse = {
        id: '1',
        fullName: 'Test User',
        email: 'test@example.com',
        roles: [ValidRoles.client],
        token: 'jwt-token',
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginUserDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginUserDto);
    });
  });

  describe('checkAuthStatus', () => {
    it('should return authenticated user status', async () => {
      const mockUser: User = {
        id: '1',
        fullName: 'Test User',
        email: 'test@example.com',
        roles: [ValidRoles.client],
        isActive: true,
      } as User;

      const result = await controller.checkAuthStatus(mockUser);

      expect(result).toEqual({
        user: mockUser,
        message: 'User is authenticated',
      });
    });
  });

  describe('adminDashboard', () => {
    it('should return admin dashboard access', async () => {
      const mockUser: User = {
        id: '1',
        fullName: 'Admin User',
        email: 'admin@example.com',
        roles: [ValidRoles.admin],
        isActive: true,
      } as User;

      const result = await controller.adminDashboard(mockUser);

      expect(result).toEqual({
        user: mockUser,
        message: 'You have access to admin dashboard',
      });
    });
  });

  describe('salesDashboard', () => {
    it('should return sales dashboard access', async () => {
      const mockUser: User = {
        id: '1',
        fullName: 'Sales User',
        email: 'sales@example.com',
        roles: [ValidRoles.salesperson],
        isActive: true,
      } as User;

      const result = await controller.salesDashboard(mockUser);

      expect(result).toEqual({
        user: mockUser,
        message: 'You have access to sales dashboard',
      });
    });
  });
}); 