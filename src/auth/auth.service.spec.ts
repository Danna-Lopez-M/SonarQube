import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { User } from '../users/entities/user.entity';
import { ValidRoles } from './interfaces/valid-roles';

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockImplementation(() => Promise.resolve(true)),
  hashSync: jest.fn().mockImplementation(() => 'hashedPassword'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let rolesService: RolesService;
  let jwtService: JwtService;

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findOne: jest.fn(),
  };

  const mockRolesService = {
    findByName: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    rolesService = module.get<RolesService>(RolesService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        dni: '123456789',
        phone: '1234567890',
      };

      const mockRole = { id: '1', name: ValidRoles.client };
      const mockUser: User = {
        id: '1',
        ...createUserDto,
        roles: [ValidRoles.client],
        isActive: true,
      } as User;

      mockRolesService.findByName.mockResolvedValue(mockRole);
      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(createUserDto);

      expect(result).toEqual({
        ...mockUser,
        password: undefined,
        token: 'jwt-token',
      });
      expect(mockRolesService.findByName).toHaveBeenCalledWith(ValidRoles.client);
      expect(mockUsersService.create).toHaveBeenCalledWith({
        ...createUserDto,
        roles: [ValidRoles.client, ValidRoles.admin, ValidRoles.technician], 
      });
    });

    it('should throw error if default role not found', async () => {
      const createUserDto: CreateUserDto = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockRolesService.findByName.mockResolvedValue(null);

      await expect(service.register(createUserDto)).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser: User = {
        id: '1',
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        roles: [ValidRoles.client],
        isActive: true,
      } as User;

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginUserDto);

      expect(result).toEqual({
        ...mockUser,
        password: undefined,
        token: 'jwt-token',
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('should throw error if email or password is missing', async () => {
      const loginUserDto: LoginUserDto = {
        email: '',
        password: '',
      };

      await expect(service.login(loginUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw error if user not found', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);
      await expect(service.login(loginUserDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should validate user successfully', async () => {
      const mockUser: User = {
        id: '1',
        fullName: 'Test User',
        email: 'test@example.com',
        roles: [ValidRoles.client],
        isActive: true,
      } as User;

      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser('1');

      expect(result).toEqual(mockUser);
    });

    it('should throw error if user is inactive', async () => {
      const mockUser: User = {
        id: '1',
        fullName: 'Test User',
        email: 'test@example.com',
        roles: [ValidRoles.client],
        isActive: false,
      } as User;

      mockUsersService.findOne.mockResolvedValue(mockUser);

      await expect(service.validateUser('1')).rejects.toThrow(UnauthorizedException);
    });
  });
}); 