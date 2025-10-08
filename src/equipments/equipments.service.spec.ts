import { Test, TestingModule } from '@nestjs/testing';
import { EquipmentsService } from './equipments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Equipment } from './entities/equipment.entity';
import { ComputerSpecs } from './entities/computer-specs.entity';
import { PrinterSpecs } from './entities/printer-specs.entity';
import { PhoneSpecs } from './entities/phone-specs.entity';

describe('EquipmentsService', () => {
  let service: EquipmentsService;

  const mockEquipment = { id: '1', name: 'Laptop', stock: 5, status: 'available' };
  const mockEquipments = [mockEquipment];


  const mockEquipmentRepo = {
    create: jest.fn().mockReturnValue(mockEquipment),
    save: jest.fn().mockResolvedValue(mockEquipment),
    find: jest.fn().mockResolvedValue(mockEquipments),
    findOne: jest.fn().mockResolvedValue(mockEquipment),
    remove: jest.fn().mockResolvedValue({}),
  };

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EquipmentsService,
        { provide: getRepositoryToken(Equipment), useValue: mockEquipmentRepo },
        { provide: getRepositoryToken(ComputerSpecs), useValue: mockRepo },
        { provide: getRepositoryToken(PrinterSpecs), useValue: mockRepo },
        { provide: getRepositoryToken(PhoneSpecs), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<EquipmentsService>(EquipmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a computer equipment with specs', async () => {
    const computerSpecs = { cpu: 'i7', ram: '16GB' };
    const dto = {
      name: 'Laptop',
      stock: 5,
      type: 'computer',
      computerSpecs,
      releaseDate: '2023-01-01'
    } as any;
  
    // Mocks para specs
    const compSpecEntity = { ...computerSpecs };
    mockRepo.create.mockReturnValueOnce(compSpecEntity);
    mockRepo.save.mockResolvedValueOnce(compSpecEntity);
  
    const expectedEquipment = expect.objectContaining({
      name: 'Laptop',
      stock: 5,
      type: 'computer',
      computerSpecs: compSpecEntity,
      releaseDate: new Date('2023-01-01')
    });
  
    await service.create(dto);
  
    expect(mockRepo.create).toHaveBeenCalledWith(computerSpecs);
    expect(mockRepo.save).toHaveBeenCalledWith(compSpecEntity);
    expect(mockEquipmentRepo.save).toHaveBeenCalledWith(expectedEquipment);
  });

  it('should return all equipments', async () => {
    const result = await service.findAll();
    expect(mockEquipmentRepo.find).toHaveBeenCalled();
    expect(result).toEqual(mockEquipments);
  });

  it('should return one equipment', async () => {
    const result = await service.findOne('1');
    expect(mockEquipmentRepo.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
      relations: ['computerSpecs', 'printerSpecs', 'phoneSpecs'],
    });
    expect(result).toEqual(mockEquipment);
  });

  it('should update equipment', async () => {
    mockEquipmentRepo.findOne.mockResolvedValueOnce(mockEquipment);
    const dto = { name: 'Updated Laptop' } as any;
    const result = await service.update('1', dto);
    expect(mockEquipmentRepo.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
      relations: ['computerSpecs', 'printerSpecs', 'phoneSpecs'],
    });
    expect(mockEquipmentRepo.save).toHaveBeenCalledWith({ ...mockEquipment, ...dto });
    expect(result).toEqual({ ...mockEquipment, ...dto });
  });

  it('should remove computer equipment and its specs', async () => {
    const equipmentWithSpecs = {
      id: '1',
      name: 'Laptop',
      type: 'computer',
      computerSpecs: { id: 'spec1', cpu: 'i7', ram: '16GB' },
      printerSpecs: undefined,
      phoneSpecs: undefined,
    };
    mockEquipmentRepo.findOne.mockResolvedValueOnce(equipmentWithSpecs);
  
    await service.remove('1');
  
    expect(mockEquipmentRepo.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
      relations: ['computerSpecs', 'printerSpecs', 'phoneSpecs'],
    });
    expect(mockRepo.remove).toHaveBeenCalledWith(equipmentWithSpecs.computerSpecs);
    expect(mockEquipmentRepo.remove).toHaveBeenCalledWith(equipmentWithSpecs);
  });
  
  it('should remove printer equipment and its specs', async () => {
    const equipmentWithSpecs = {
      id: '2',
      name: 'Printer',
      type: 'printer',
      computerSpecs: undefined,
      printerSpecs: { id: 'spec2', dpi: 1200 },
      phoneSpecs: undefined,
    };
    mockEquipmentRepo.findOne.mockResolvedValueOnce(equipmentWithSpecs);
  
    await service.remove('2');
  
    expect(mockRepo.remove).toHaveBeenCalledWith(equipmentWithSpecs.printerSpecs);
    expect(mockEquipmentRepo.remove).toHaveBeenCalledWith(equipmentWithSpecs);
  });
  
  it('should remove phone equipment and its specs', async () => {
    const equipmentWithSpecs = {
      id: '3',
      name: 'Phone',
      type: 'phone',
      computerSpecs: undefined,
      printerSpecs: undefined,
      phoneSpecs: { id: 'spec3', os: 'Android' },
    };
    mockEquipmentRepo.findOne.mockResolvedValueOnce(equipmentWithSpecs);
  
    await service.remove('3');
  
    expect(mockRepo.remove).toHaveBeenCalledWith(equipmentWithSpecs.phoneSpecs);
    expect(mockEquipmentRepo.remove).toHaveBeenCalledWith(equipmentWithSpecs);
  });
  
  it('should throw error if equipment not found', async () => {
    mockEquipmentRepo.findOne.mockResolvedValueOnce(undefined);
  
    await expect(service.remove('notfound')).rejects.toThrow('Equipo no encontrado');
  });

  it('should throw error if equipment not found in update', async () => {
    mockEquipmentRepo.findOne.mockResolvedValueOnce(undefined);
    await expect(service.update('notfound', {})).rejects.toThrow('Equipo no encontrado');
  });

  it('should update computer specs if present', async () => {
    const equipmentWithSpecs = {
      ...mockEquipment,
      type: 'computer',
      computerSpecs: { id: 'spec1', ram: '8GB' }
    };
    mockEquipmentRepo.findOne.mockResolvedValueOnce(equipmentWithSpecs);
    const dto = { specifications: { ram: '16GB' } };
    await service.update('1', dto);
    expect(mockRepo.save).toHaveBeenCalledWith({ id: 'spec1', ram: '16GB' });
    expect(mockEquipmentRepo.save).toHaveBeenCalled();
  });

  it('should update printer specs if present', async () => {
    const equipmentWithSpecs = {
      ...mockEquipment,
      type: 'printer',
      printerSpecs: { id: 'spec2', dpi: 600 }
    };
    mockEquipmentRepo.findOne.mockResolvedValueOnce(equipmentWithSpecs);
    const dto = { specifications: { dpi: 1200 } };
    await service.update('1', dto);
    expect(mockRepo.save).toHaveBeenCalledWith({ id: 'spec2', dpi: 1200 });
    expect(mockEquipmentRepo.save).toHaveBeenCalled();
  });

  it('should update phone specs if present', async () => {
    const equipmentWithSpecs = {
      ...mockEquipment,
      type: 'phone',
      phoneSpecs: { id: 'spec3', os: 'Android' }
    };
    mockEquipmentRepo.findOne.mockResolvedValueOnce(equipmentWithSpecs);
    const dto = { specifications: { os: 'iOS' } };
    await service.update('1', dto);
    expect(mockRepo.save).toHaveBeenCalledWith({ id: 'spec3', os: 'iOS' });
    expect(mockEquipmentRepo.save).toHaveBeenCalled();
  });

  it('should update equipment without specs', async () => {
    const equipmentNoSpecs = { ...mockEquipment, type: 'computer', computerSpecs: undefined };
    mockEquipmentRepo.findOne.mockResolvedValueOnce(equipmentNoSpecs);
    const dto = { name: 'No Specs' };
    await service.update('1', dto);
    expect(mockEquipmentRepo.save).toHaveBeenCalledWith({ ...equipmentNoSpecs, ...dto });
  });

  it('should update stock', async () => {
    mockEquipmentRepo.findOne.mockResolvedValueOnce(mockEquipment);
    mockEquipmentRepo.save.mockResolvedValueOnce({ ...mockEquipment, stock: 10 });
    const result = await service.updateStock('1', 10);
    expect(result.stock).toBe(10);
    expect(mockEquipmentRepo.save).toHaveBeenCalledWith({ ...mockEquipment, stock: 10 });
  });

  it('should throw error if equipment not found in updateStock', async () => {
    mockEquipmentRepo.findOne.mockResolvedValueOnce(undefined);
    await expect(service.updateStock('notfound', 5)).rejects.toThrow('Equipment not found');
  });

  it('should return correct status in toResponseDto (available)', () => {
    const equipment = { ...mockEquipment, stock: 2, isInRepair: false };
    const result = (service as any).toResponseDto(equipment);
    expect(result.status).toBe('available');
  });

  it('should return correct status in toResponseDto (out-of-stock)', () => {
    const equipment = { ...mockEquipment, stock: 0, isInRepair: false };
    const result = (service as any).toResponseDto(equipment);
    expect(result.status).toBe('out-of-stock');
  });

  it('should return correct status in toResponseDto (in-repair)', () => {
    const equipment = { ...mockEquipment, stock: 2, isInRepair: true };
    const result = (service as any).toResponseDto(equipment);
    expect(result.status).toBe('in-repair');
  });

});