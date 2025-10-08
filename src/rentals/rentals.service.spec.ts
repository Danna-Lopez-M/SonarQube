import { Test, TestingModule } from '@nestjs/testing';
import { RentalsService } from './rentals.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RentalContract } from './entities/rental.entity';
import { Contract } from '../contract/entities/contract.entity';
import { EquipmentsService } from '../equipments/equipments.service';
import { ContractService } from '../contract/contract.service';
import { validate } from 'class-validator';
import { CreateRentalDto } from './dto/create-rental.dto';


describe('RentalsService', () => {
  let service: RentalsService;
  let rentalRepo: any;
  let contractRepo: any;
  let equipmentService: any;
  let contractService: any;

  const mockRental = { id: '1', equipment: { id: 'eq1', stock: 2, isInRepair: false }, startDate: new Date('2024-01-01'), endDate: new Date('2024-01-10'), status: 'pending' };
  const mockContract = { id: 'c1' };
  const mockUser = { id: 'user1', roles: ['admin'] };

  beforeEach(async () => {
    rentalRepo = {
      create: jest.fn().mockReturnValue(mockRental),
      save: jest.fn().mockResolvedValue(mockRental),
      find: jest.fn().mockResolvedValue([mockRental]),
      findOne: jest.fn().mockResolvedValue(mockRental),
      count: jest.fn().mockResolvedValue(1),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ revenue: '1000' }),
      }),
    };
    contractRepo = {
      save: jest.fn().mockResolvedValue(mockContract),
    };
    equipmentService = {
      findOne: jest.fn().mockResolvedValue({ ...mockRental.equipment }),
      updateStock: jest.fn(),
    };
    contractService = {
      createFromRental: jest.fn().mockResolvedValue(mockContract),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RentalsService,
        { provide: getRepositoryToken(RentalContract), useValue: rentalRepo },
        { provide: getRepositoryToken(Contract), useValue: contractRepo },
        { provide: EquipmentsService, useValue: equipmentService },
        { provide: ContractService, useValue: contractService },
      ],
    }).compile();

    service = module.get<RentalsService>(RentalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a rental request', async () => {
    const dto = { equipmentId: 'eq1', startDate: new Date('2024-01-01'), endDate: new Date('2024-01-10') };
    const result = await service.createRequest('user1', dto as any);
    expect(equipmentService.findOne).toHaveBeenCalledWith('eq1');
    expect(rentalRepo.create).toHaveBeenCalled();
    expect(rentalRepo.save).toHaveBeenCalled();
    expect(contractService.createFromRental).toHaveBeenCalled();
    expect(contractRepo.save).toHaveBeenCalled();
    expect(equipmentService.updateStock).toHaveBeenCalledWith('eq1', 1);
    expect(result).toHaveProperty('rentalContract');
    expect(result).toHaveProperty('contract');
  });

  it('should throw if equipment is in repair', async () => {
    equipmentService.findOne.mockResolvedValueOnce({ ...mockRental.equipment, isInRepair: true });
    const dto = { equipmentId: 'eq1', startDate: new Date(), endDate: new Date(Date.now() + 1000 * 60 * 60 * 24) };
    await expect(service.createRequest('user1', dto as any)).rejects.toThrow('This equipment is currently under repair');
  });

  it('should throw if equipment stock is 0', async () => {
    equipmentService.findOne.mockResolvedValueOnce({ ...mockRental.equipment, stock: 0 });
    const dto = { equipmentId: 'eq1', startDate: new Date(), endDate: new Date(Date.now() + 1000 * 60 * 60 * 24) };
    await expect(service.createRequest('user1', dto as any)).rejects.toThrow('Equipment out of stock');
  });

  it('should throw if endDate is before startDate', async () => {
    const dto = { equipmentId: 'eq1', startDate: new Date('2024-01-10'), endDate: new Date('2024-01-01') };
    await expect(service.createRequest('user1', dto as any)).rejects.toThrow('End date must be after start date');
  });

  it('should find rentals by client', async () => {
    const result = await service.findByClient('user1');
    expect(rentalRepo.find).toHaveBeenCalledWith({
      where: { client: { id: 'user1' } },
      relations: ['equipment'],
    });
    expect(result).toEqual([mockRental]);
  });

  it('should find all rentals with filter', async () => {
    const filterDto = { status: 'pending', startDate: new Date('2024-01-01'), endDate: new Date('2024-01-10') };
    const result = await service.findAll(filterDto as any);
    expect(rentalRepo.find).toHaveBeenCalled();
    expect(result).toEqual([mockRental]);
  });

  it('should update rental status', async () => {
    rentalRepo.findOne.mockResolvedValueOnce({ ...mockRental, status: 'pending', equipment: { id: 'eq1', stock: 2 } });
    rentalRepo.save.mockImplementation(rental => Promise.resolve(rental));
    const updateDto = { status: 'approved' };
    const result = await service.updateStatus('1', updateDto as any, mockUser as any);
    expect(rentalRepo.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
      relations: ['equipment'],
    });
    expect(rentalRepo.save).toHaveBeenCalled();
    expect(result).toHaveProperty('status', 'approved');
  });

  it('should throw if contract not found on updateStatus', async () => {
    rentalRepo.findOne.mockResolvedValueOnce(undefined);
    await expect(service.updateStatus('notfound', { status: 'approved' } as any, mockUser as any)).rejects.toThrow('Contract not found');
  });

  it('should throw if user is not authorized to update status', async () => {
    rentalRepo.findOne.mockResolvedValueOnce(mockRental);
    const notAllowedUser = { id: 'user2', roles: ['client'] };
    await expect(service.updateStatus('1', { status: 'approved' } as any, notAllowedUser as any)).rejects.toThrow('Unauthorized to update status');
  });

  it('should get active deliveries', async () => {
    const result = await service.getActiveDeliveries();
    expect(rentalRepo.find).toHaveBeenCalled();
    expect(result).toEqual([mockRental]);
  });

  it('should get rental metrics', async () => {
    const result = await service.getRentalMetrics();
    expect(rentalRepo.count).toHaveBeenCalledWith({ where: { status: 'approved' } });
    expect(rentalRepo.count).toHaveBeenCalledWith({ where: { status: 'pending' } });
    expect(result).toEqual({ active: 1, pending: 1, revenue: 1000 });
  });


  describe('CreateRentalDto', () => {
    
    it('should require equipmentId', async () => {
      const dto = new CreateRentalDto();
      dto.startDate = new Date('2024-01-01');
      dto.endDate = new Date('2024-01-10');
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'equipmentId')).toBe(true);
    });

    it('should require startDate', async () => {
      const dto = new CreateRentalDto();
      dto.equipmentId = 'eq1';
      dto.endDate = new Date('2024-01-10');
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'startDate')).toBe(true);
    });

    it('should require endDate', async () => {
      const dto = new CreateRentalDto();
      dto.equipmentId = 'eq1';
      dto.startDate = new Date('2024-01-01');
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'endDate')).toBe(true);
    });

    it('should fail if startDate is not a date', async () => {
      const dto = new CreateRentalDto();
      dto.equipmentId = 'eq1';
      dto.startDate = 'not-a-date' as any;
      dto.endDate = new Date('2024-01-10');
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'startDate')).toBe(true);
    });

    it('should fail if endDate is not a date', async () => {
      const dto = new CreateRentalDto();
      dto.equipmentId = 'eq1';
      dto.startDate = new Date('2024-01-01');
      dto.endDate = 'not-a-date' as any;
      const errors = await validate(dto);
      expect(errors.some(e => e.property === 'endDate')).toBe(true);
    });
  });
});