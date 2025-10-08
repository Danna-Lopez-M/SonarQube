import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser: User = {
    id: '1',
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword',
    dni: '12345678',
    phone: '555-1234',
    isActive: true,
    roles: ['client'],
    contracts: [],
    //checkEmail: jest.fn(),
    //checkEmailUpdate: jest.fn(),
  };

  const mockUsersService = {
    findAll: jest.fn().mockResolvedValue([mockUser]),
    findOne: jest.fn().mockResolvedValue(mockUser),
    findByEmail: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue({ ...mockUser, fullName: 'Updated User' }),
    remove: jest.fn().mockResolvedValue({ message: 'User deleted' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all users', async () => {
    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockUser]);
  });

  it('should return one user by id', async () => {
    const result = await controller.findOne('1');
    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual(mockUser);
  });

  it('should return one user by email', async () => {
    const result = await controller.findOneByEmail('test@example.com');
    expect(service.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(result).toEqual(mockUser);
  });

  it('should update a user', async () => {
    const dto = { fullName: 'Updated User' };
    const result = await controller.update('1', dto as any);
    expect(service.update).toHaveBeenCalledWith('1', dto);
    expect(result).toEqual({ ...mockUser, fullName: 'Updated User' });
  });

  it('should remove a user', async () => {
    const result = await controller.remove('1');
    expect(service.remove).toHaveBeenCalledWith('1');
    expect(result).toEqual({ message: 'User deleted' });
  });
});