import { Test, TestingModule } from '@nestjs/testing';
import { DeliveriesController } from './deliveries.controller';
import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';


describe('DeliveriesController', () => {
  let controller: DeliveriesController;
  let service: DeliveriesService;

  const mockDelivery = { id: '1', type: 'delivery' };
  const mockDeliveries = [mockDelivery];

  const mockDeliveriesService = {
    create: jest.fn().mockResolvedValue({ message: 'Entrega/Devolución registrada', delivery: mockDelivery }),
    findAll: jest.fn().mockResolvedValue(mockDeliveries),
    findOne: jest.fn().mockResolvedValue(mockDelivery),
    update: jest.fn().mockResolvedValue({ message: 'Entrega/Devolución actualizada', delivery: mockDelivery }),
    remove: jest.fn().mockResolvedValue({ message: 'Registro eliminado' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveriesController],
      providers: [
        { provide: DeliveriesService, useValue: mockDeliveriesService },
      ],
    }).compile();

    controller = module.get<DeliveriesController>(DeliveriesController);
    service = module.get<DeliveriesService>(DeliveriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a delivery', async () => {
    const dto: CreateDeliveryDto = {
      rental: { id: 'r1' },
      technician: { id: 't1' },
      client: { id: 'c1' }
      
    };
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ message: 'Entrega/Devolución registrada', delivery: mockDelivery });
  });

  it('should return all deliveries', async () => {
    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockDeliveries);
  });

  it('should return one delivery', async () => {
    const result = await controller.findOne('1');
    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual(mockDelivery);
  });

  it('should update a delivery', async () => {
    const dto: UpdateDeliveryDto = { status: 'accepted' };
    const result = await controller.update('1', dto);
    expect(service.update).toHaveBeenCalledWith('1', dto);
    expect(result).toEqual({ message: 'Entrega/Devolución actualizada', delivery: mockDelivery });
  });

  it('should remove a delivery', async () => {
    const result = await controller.remove('1');
    expect(service.remove).toHaveBeenCalledWith('1');
    expect(result).toEqual({ message: 'Registro eliminado' });
  });
});