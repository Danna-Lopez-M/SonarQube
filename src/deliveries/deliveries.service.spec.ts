import { Test, TestingModule } from '@nestjs/testing';
import { DeliveriesService } from './deliveries.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Delivery } from './entities/delivery.entity';

describe('DeliveriesService', () => {
  let service: DeliveriesService;

  const mockDelivery = { id: '1', type: 'delivery' };
  const mockDeliveries = [mockDelivery];

  const mockDeliveryRepo = {
    create: jest.fn().mockReturnValue(mockDelivery),
    save: jest.fn().mockResolvedValue(mockDelivery),
    find: jest.fn().mockResolvedValue(mockDeliveries),
    findOne: jest.fn().mockResolvedValue(mockDelivery),
    remove: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveriesService,
        {
          provide: getRepositoryToken(Delivery),
          useValue: mockDeliveryRepo,
        },
      ],
    }).compile();

    service = module.get<DeliveriesService>(DeliveriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a delivery', async () => {
    const dto = {
      type: 'delivery',
      rental: { id: '123' },
      technician: { id: 't1' },
      client: { id: 'c1' },
      actDocumentUrl: undefined,
      clientSignatureUrl: undefined,
      technicalObservations: undefined,
      visualObservations: undefined,
    } as any;
  
    const expectedCreateArg = {
      rental: { id: '123' },
      technician: { id: 't1' },
      client: { id: 'c1' },
      actDocumentUrl: undefined,
      clientSignatureUrl: undefined,
      visualObservations: undefined,
      technicalObservations: undefined,
    };
  
    const result = await service.create(dto);
    expect(mockDeliveryRepo.create).toHaveBeenCalledWith(expectedCreateArg);
    expect(mockDeliveryRepo.save).toHaveBeenCalledWith(mockDelivery);
    expect(result).toEqual({
      delivery: mockDelivery,
      message: 'Entrega creada exitosamente',
    });
  });

  it('should return all deliveries', async () => {
    const result = await service.findAll();
    expect(mockDeliveryRepo.find).toHaveBeenCalled();
    expect(result).toEqual(mockDeliveries);
  });

  it('should return one delivery', async () => {
    const result = await service.findOne('1');
    expect(mockDeliveryRepo.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
      relations: ['rental', 'technician', 'client'],
    });
  });

  it('should update a delivery', async () => {
    mockDeliveryRepo.findOne.mockResolvedValueOnce(mockDelivery);
    const dto = { type: 'return' } as any;
    const result = await service.update('1', dto);
    expect(mockDeliveryRepo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(mockDeliveryRepo.save).toHaveBeenCalledWith({ ...mockDelivery, ...dto });
    expect(result).toEqual({ message: 'Entrega/Devolución actualizada', delivery: { ...mockDelivery, ...dto } });
  });

  it('should remove a delivery', async () => {
    mockDeliveryRepo.findOne.mockResolvedValueOnce(mockDelivery);
    const result = await service.remove('1');
    expect(mockDeliveryRepo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(mockDeliveryRepo.remove).toHaveBeenCalledWith(mockDelivery);
    expect(result).toEqual({ message: 'Deleted record' });
  });

});