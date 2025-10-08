import { Test, TestingModule } from '@nestjs/testing';
import { RentalsController } from './rentals.controller';
import { RentalsService } from './rentals.service';
import { ValidRoles } from '../auth/interfaces/valid-roles';

describe('RentalsController', () => {
  let controller: RentalsController;
  let service: RentalsService;

  const mockUser = { id: 'user1', role: ValidRoles.client };
  const mockRental = { id: '1', equipmentId: 'eq1', userId: 'user1', status: 'pending' };
  const mockRentals = [mockRental];
  const mockMetrics = { total: 10, active: 2 };

  const mockRentalsService = {
    createRequest: jest.fn().mockResolvedValue(mockRental),
    findByClient: jest.fn().mockResolvedValue(mockRentals),
    findAll: jest.fn().mockResolvedValue(mockRentals),
    updateStatus: jest.fn().mockResolvedValue({ ...mockRental, status: 'approved' }),
    getActiveDeliveries: jest.fn().mockResolvedValue(mockRentals),
    getRentalMetrics: jest.fn().mockResolvedValue(mockMetrics),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RentalsController],
      providers: [
        { provide: RentalsService, useValue: mockRentalsService },
      ],
    }).compile();

    controller = module.get<RentalsController>(RentalsController);
    service = module.get<RentalsService>(RentalsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a rental request', async () => {
    const dto = { equipmentId: 'eq1', startDate: new Date('2024-01-01'), endDate: new Date('2024-01-10') };
    const result = await controller.createRequest(dto, mockUser as any);
    expect(service.createRequest).toHaveBeenCalledWith(mockUser.id, dto);
    expect(result).toEqual(mockRental);
  });

  it('should return my contracts', async () => {
    const result = await controller.findMyContracts(mockUser as any);
    expect(service.findByClient).toHaveBeenCalledWith(mockUser.id);
    expect(result).toEqual(mockRentals);
  });

  it('should return all rentals', async () => {
    const filterDto = { status: 'pending' };
    const result = await controller.findAll(filterDto as any);
    expect(service.findAll).toHaveBeenCalledWith(filterDto);
    expect(result).toEqual(mockRentals);
  });

  it('should update rental status', async () => {
    const updateDto = { status: 'approved' };
    const result = await controller.updateStatus('1', updateDto as any, mockUser as any);
    expect(service.updateStatus).toHaveBeenCalledWith('1', updateDto, mockUser);
    expect(result).toEqual({ ...mockRental, status: 'approved' });
  });

  it('should get active deliveries', async () => {
    const result = await controller.getActiveDeliveries();
    expect(service.getActiveDeliveries).toHaveBeenCalled();
    expect(result).toEqual(mockRentals);
  });

  it('should get rental metrics', async () => {
    const result = await controller.getMetrics();
    expect(service.getRentalMetrics).toHaveBeenCalled();
    expect(result).toEqual(mockMetrics);
  });
});