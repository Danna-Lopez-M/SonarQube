import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('RolesService', () => {
  let service: RolesService;
  let repo: any;

  const mockRole = { id: '1', name: 'admin' };
  const mockRoles = [mockRole];

  const mockRepo = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: getRepositoryToken(Role), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    repo = module.get(getRepositoryToken(Role));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a role', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.create.mockReturnValue(mockRole);
    mockRepo.save.mockResolvedValue(mockRole);

    const dto = { name: 'admin' };
    const result = await service.create(dto as any);

    expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { name: 'admin' } });
    expect(mockRepo.create).toHaveBeenCalledWith(dto);
    expect(mockRepo.save).toHaveBeenCalledWith(mockRole);
    expect(result).toEqual(mockRole);
  });

  it('should throw ConflictException if role already exists', async () => {
    mockRepo.findOne.mockResolvedValue(mockRole);
    const dto = { name: 'admin' };
    await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
  });

  it('should return all roles', async () => {
    mockRepo.find.mockResolvedValue(mockRoles);
    const result = await service.findAll();
    expect(mockRepo.find).toHaveBeenCalled();
    expect(result).toEqual(mockRoles);
  });

  it('should return one role by id', async () => {
    mockRepo.findOneBy.mockResolvedValue(mockRole);
    const result = await service.findOne('1');
    expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: '1' });
    expect(result).toEqual(mockRole);
  });

  it('should throw NotFoundException if role not found', async () => {
    mockRepo.findOneBy.mockResolvedValue(null);
    await expect(service.findOne('2')).rejects.toThrow(NotFoundException);
  });

  it('should update a role', async () => {
    mockRepo.findOneBy.mockResolvedValue(mockRole);
    mockRepo.save.mockResolvedValue({ ...mockRole, name: 'updated' });
    const dto = { name: 'updated' };
    const result = await service.update('1', dto as any);
    expect(mockRepo.save).toHaveBeenCalledWith({ ...mockRole, ...dto });
    expect(result).toEqual({ ...mockRole, name: 'updated' });
  });

  it('should remove a role', async () => {
    mockRepo.findOneBy.mockResolvedValue(mockRole);
    mockRepo.remove.mockResolvedValue(undefined);
    await expect(service.remove('1')).resolves.toBeUndefined();
    expect(mockRepo.remove).toHaveBeenCalledWith(mockRole);
  });

  it('should find by name', async () => {
    mockRepo.findOne.mockResolvedValue(mockRole);
    const result = await service.findByName('admin');
    expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { name: 'admin' } });
    expect(result).toEqual(mockRole);
  });
});