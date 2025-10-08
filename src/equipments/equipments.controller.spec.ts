import { Test, TestingModule } from '@nestjs/testing';
import { EquipmentsController } from './equipments.controller';
import { EquipmentsService } from './equipments.service';

describe('EquipmentsController', () => {
  let controller: EquipmentsController;
  let service: EquipmentsService;

  const mockEquipment = { id: '1', name: 'Laptop', stock: 5 };
  const mockEquipments = [mockEquipment];

  const mockEquipmentsService = {
    create: jest.fn().mockResolvedValue(mockEquipment),
    findAll: jest.fn().mockResolvedValue(mockEquipments),
    findOne: jest.fn().mockResolvedValue(mockEquipment),
    update: jest.fn().mockResolvedValue({ ...mockEquipment, name: 'Updated Laptop' }),
    remove: jest.fn().mockResolvedValue({ message: 'Equipo eliminado' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EquipmentsController],
      providers: [
        { provide: EquipmentsService, useValue: mockEquipmentsService },
      ],
    }).compile();

    controller = module.get<EquipmentsController>(EquipmentsController);
    service = module.get<EquipmentsService>(EquipmentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create equipment', async () => {
    const dto = {
      name: 'Laptop',
      stock: 5,
      type: 'laptop',
      brand: 'Dell',
      model: 'XPS 13',
      description: 'Ultrabook',
      serialNumber: 'SN123',
      price: 1000,
      warrantyPeriod: '12',
      releaseDate: '2023-01-01'
    };
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockEquipment);
  });

  it('should return all equipments', async () => {
    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockEquipments);
  });

  it('should return one equipment', async () => {
    const result = await controller.findOne('1');
    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual(mockEquipment);
  });

  it('should update equipment', async () => {
    const dto = { name: 'Updated Laptop' };
    const result = await controller.update('1', dto);
    expect(service.update).toHaveBeenCalledWith('1', dto);
    expect(result).toEqual({ ...mockEquipment, name: 'Updated Laptop' });
  });

  it('should remove equipment', async () => {
    const result = await controller.remove('1');
    expect(service.remove).toHaveBeenCalledWith('1');
    expect(result).toEqual({ message: 'Equipo eliminado' });
  });
  it('should return empty array if no equipments exist', async () => {
    jest.spyOn(service, 'findAll').mockResolvedValueOnce([]);
    const result = await controller.findAll();
    expect(result).toEqual([]);
  });

  it('should throw if service.create throws', async () => {
    jest.spyOn(service, 'create').mockRejectedValueOnce(new Error('Create error'));
    await expect(controller.create({ name: 'Laptop' } as any)).rejects.toThrow('Create error');
  });

  it('should throw if service.findOne throws', async () => {
    jest.spyOn(service, 'findOne').mockRejectedValueOnce(new Error('Not found'));
    await expect(controller.findOne('bad-id')).rejects.toThrow('Not found');
  });

  it('should throw if service.update throws', async () => {
    jest.spyOn(service, 'update').mockRejectedValueOnce(new Error('Update error'));
    await expect(controller.update('1', { name: 'fail' })).rejects.toThrow('Update error');
  });

  it('should throw if service.remove throws', async () => {
    jest.spyOn(service, 'remove').mockRejectedValueOnce(new Error('Remove error'));
    await expect(controller.remove('1')).rejects.toThrow('Remove error');
  });

  it('should call update with correct params', async () => {
    const dto = { name: 'Another Name' };
    await controller.update('2', dto);
    expect(service.update).toHaveBeenCalledWith('2', dto);
  });

  it('should call remove with correct id', async () => {
    await controller.remove('2');
    expect(service.remove).toHaveBeenCalledWith('2');
  });
});