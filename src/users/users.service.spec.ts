import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { validate } from 'class-validator';
import { CreateUserDto } from '../auth/dtos/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';


describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<User>>;

  const mockUser = {
    id: '1',
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword',
    dni: '12345678',
    phone: '555-1234',
    isActive: true,
    roles: ['client'],
    contracts: [],
  };

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
    // Mock para createQueryBuilder
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(mockUser),
    })),
    // Mock para preload
    preload: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all users', async () => {
    mockRepo.find.mockResolvedValue([mockUser]);
    const result = await service.findAll();
    expect(mockRepo.find).toHaveBeenCalled();
    expect(result).toEqual([mockUser]);
  });

  it('should return one user by id', async () => {
    mockRepo.findOneBy.mockResolvedValue(mockUser);
    const result = await service.findOne('1');
    expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: '1' });
    expect(result).toEqual(mockUser);
  });

  it('should return one user by email', async () => {
    const result = await service.findByEmail('test@example.com');
    expect(mockRepo.createQueryBuilder).toHaveBeenCalledWith('user');
    expect(result).toEqual(mockUser);
  });

  it('should update a user', async () => {
    mockRepo.preload.mockImplementation(async (user) => {
      if (user.id !== mockUser.id) {
        throw new NotFoundException(`User with ID ${user.id} not found`);
      }
      return { ...mockUser, fullName: 'Updated User' };
    });
    mockRepo.save.mockResolvedValue({ ...mockUser, fullName: 'Updated User' });
    const dto = { fullName: 'Updated User' };
    const result = await service.update('1', dto as any);
    expect(mockRepo.preload).toHaveBeenCalledWith({ id: '1', ...dto });
    expect(mockRepo.save).toHaveBeenCalledWith({ ...mockUser, fullName: 'Updated User' });
    expect(result).toEqual({
      passwordChanged: false,
      user: {
        ...mockUser,
        fullName: 'Updated User',
        password: undefined, // omitted
      },
    });
  });

  it('should remove a user', async () => {
    mockRepo.findOneBy.mockResolvedValue(mockUser);
    mockRepo.remove.mockResolvedValue(undefined);
    await expect(service.remove('1')).resolves.toBeUndefined();
    expect(mockRepo.remove).toHaveBeenCalledWith(mockUser);
  });
  describe('CreateUserDto', () => {
    it('should validate a correct dto', async () => {
      const dto = new CreateUserDto();
      dto.fullName = 'Test User';
      dto.email = 'test@example.com';
      dto.password = 'Password123';
      dto.dni = '12345678';
      dto.phone = '555-1234';
      dto.roles = ['client'];
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should require fullName, email, password', async () => {
      const dto = new CreateUserDto();
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'fullName')).toBe(true);
      expect(errors.some(e => e.property === 'email')).toBe(true);
      expect(errors.some(e => e.property === 'password')).toBe(true);
    });

    it('should fail if fullName is too short', async () => {
      const dto = new CreateUserDto();
      dto.fullName = 'ab';
      dto.email = 'test@example.com';
      dto.password = 'Password123';
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'fullName')).toBe(true);
    });

    it('should fail if email is invalid', async () => {
      const dto = new CreateUserDto();
      dto.fullName = 'Test User';
      dto.email = 'not-an-email';
      dto.password = 'Password123';
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'email')).toBe(true);
    });

    it('should fail if password is weak', async () => {
      const dto = new CreateUserDto();
      dto.fullName = 'Test User';
      dto.email = 'test@example.com';
      dto.password = 'weak';
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'password')).toBe(true);
    });

    it('should allow optional dni, phone, roles', async () => {
      const dto = new CreateUserDto();
      dto.fullName = 'Test User';
      dto.email = 'test@example.com';
      dto.password = 'Password123';
      dto.dni = undefined;
      dto.phone = undefined;
      dto.roles = undefined;
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('UpdateUserDto', () => {
    it('should validate a correct dto', async () => {
      const dto = new UpdateUserDto();
      dto.fullName = 'Updated User';
      dto.email = 'updated@example.com';
      dto.password = 'newpassword';
      dto.dni = '87654321';
      dto.phone = '555-4321';
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if fullName is too short', async () => {
      const dto = new UpdateUserDto();
      dto.fullName = 'ab';
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'fullName')).toBe(true);
    });

    it('should fail if email is invalid', async () => {
      const dto = new UpdateUserDto();
      dto.email = 'not-an-email';
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'email')).toBe(true);
    });

    it('should fail if password is too short', async () => {
      const dto = new UpdateUserDto();
      dto.password = '123';
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'password')).toBe(true);
    });
  });
});