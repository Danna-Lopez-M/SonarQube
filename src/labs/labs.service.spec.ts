import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LabsService } from './labs.service';
import { Lab } from './entities/lab.entity';
import { RentalContract } from '../rentals/entities/rental.entity';
import { Contract } from '../contract/entities/contract.entity';
import { Equipment } from '../equipments/entities/equipment.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';


describe('LabsService', () => {
  let service: LabsService;

  const mockLab = { id: '1', name: 'Lab 1', location: 'Building A' };
  const mockLabs = [mockLab];
  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  

  const mockLabsRepo = {
    create: jest.fn().mockReturnValue(mockLab),
    save: jest.fn().mockResolvedValue(mockLab),
    find: jest.fn().mockResolvedValue(mockLabs),
    findOne: jest.fn().mockResolvedValue(mockLab),
    update: jest.fn().mockResolvedValue({ ...mockLab, name: 'Updated Lab' }),
    remove: jest.fn().mockResolvedValue({ message: 'Lab deleted' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LabsService,
        { provide: getRepositoryToken(Lab), useValue: mockLabsRepo },
        { provide: getRepositoryToken(RentalContract), useValue: mockRepo },
        { provide: getRepositoryToken(Contract), useValue: mockRepo },
        { provide: getRepositoryToken(Equipment), useValue: mockRepo },
      ],
    }).compile();
  
    service = module.get<LabsService>(LabsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a lab', async () => {
    const dto = { name: 'Lab 1', location: 'Building A' };
    const result = await service.create(dto as any);
    expect(mockLabsRepo.create).toHaveBeenCalledWith(dto);
    expect(mockLabsRepo.save).toHaveBeenCalledWith(mockLab);
    expect(result).toEqual({ message: 'Laboratorio creado exitosamente', lab: mockLab });  });

  it('should return all labs', async () => {
    const result = await service.findAll();
    expect(mockLabsRepo.find).toHaveBeenCalled();
    expect(result).toEqual({ labs: mockLabs, message: 'Laboratorios encontrados' });
  });

  it('should return one lab', async () => {
    const result = await service.findOne(1);
    expect(mockLabsRepo.findOne).toHaveBeenCalledWith({ where: { id: '1' }, relations: ['equipment', 'reportedBy'] });
  });

  it('should update a lab', async () => {
    const dto = { name: 'Updated Lab' };
    mockLabsRepo.findOne.mockResolvedValueOnce(mockLab);
    const result = await service.update(1, dto as any);
    expect(mockLabsRepo.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
      relations: ['equipment', 'reportedBy'],
    });
    expect(mockLabsRepo.save).toHaveBeenCalledWith({ ...mockLab, ...dto });
    expect(result).toEqual({
      message: 'Laboratorio actualizado exitosamente',
      lab: { ...mockLab, ...dto }
    });
  });
  
  it('should remove a lab', async () => {
    mockLabsRepo.findOne.mockResolvedValueOnce(mockLab);
    const result = await service.remove(1);
    expect(mockLabsRepo.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
      relations: ['equipment', 'reportedBy'],
    });
    expect(mockLabsRepo.remove).toHaveBeenCalledWith(mockLab);
    expect(result).toEqual({ message: 'Laboratorio eliminado exitosamente' });
  });


  it('should throw NotFoundException if lab not found in findOne', async () => {
    mockLabsRepo.findOne.mockResolvedValueOnce(undefined);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if lab not found in update', async () => {
    mockLabsRepo.findOne.mockResolvedValueOnce(undefined);
    await expect(service.update(999, { name: 'fail' } as any)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if lab not found in remove', async () => {
    mockLabsRepo.findOne.mockResolvedValueOnce(undefined);
    await expect(service.remove(999)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if contract not found in reportBrokenEquipment', async () => {
    mockRepo.findOne.mockResolvedValueOnce(undefined);
    await expect(service.reportBrokenEquipment('u1', 'c1')).rejects.toThrow('Contract not found');
  });

  it('should throw BadRequestException if user is not contract client in reportBrokenEquipment', async () => {
    mockRepo.findOne.mockResolvedValueOnce({ id: 'c1', client: { id: 'other' } });
    await expect(service.reportBrokenEquipment('u1', 'c1')).rejects.toThrow(BadRequestException);
  });

  it('should report broken equipment', async () => {
    const contract = {
      id: 'c1',
      client: { id: 'u1' },
      equipment: { id: 'eq1', isInRepair: false },
      isDisabled: false,
    };
    mockRepo.findOne.mockResolvedValueOnce(contract);
    mockLabsRepo.create.mockReturnValueOnce({ id: 'lab1' });
    mockLabsRepo.save.mockResolvedValueOnce({ id: 'lab1' });
    mockRepo.save.mockResolvedValueOnce({ ...contract, isDisabled: true });
    mockRepo.save.mockResolvedValueOnce({ ...contract, isDisabled: true });
    mockRepo.save.mockResolvedValueOnce({ ...contract, isDisabled: true });
    const result = await service.reportBrokenEquipment('u1', 'c1', 'notes');
    expect(result).toHaveProperty('message');
    expect(mockLabsRepo.save).toHaveBeenCalled();
  });

  it('should throw NotFoundException if lab not found in markAsRepaired', async () => {
    mockLabsRepo.findOne.mockResolvedValueOnce(undefined);
    await expect(service.markAsRepaired('bad-id')).rejects.toThrow(NotFoundException);
  });

  

});