import { Test, TestingModule } from '@nestjs/testing';
import { LabsController } from './labs.controller';
import { LabsService } from './labs.service';

describe('LabsController', () => {
  let controller: LabsController;
  let service: LabsService;

  const mockLab = { id: '1', name: 'Lab 1', location: 'Building A' };
  const mockLabs = [mockLab];

  const mockLabsService = {
    create: jest.fn().mockResolvedValue(mockLab),
    findAll: jest.fn().mockResolvedValue(mockLabs),
    findOne: jest.fn().mockResolvedValue(mockLab),
    update: jest.fn().mockResolvedValue({ ...mockLab, name: 'Updated Lab' }),
    remove: jest.fn().mockResolvedValue({ message: 'Lab deleted' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabsController],
      providers: [
        { provide: LabsService, useValue: mockLabsService },
      ],
    }).compile();

    controller = module.get<LabsController>(LabsController);
    service = module.get<LabsService>(LabsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  
  it('should return all labs', async () => {
    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockLabs);
  });

  it('should return one lab', async () => {
    const result = await controller.findOne('1');
    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockLab);
  });

  it('should create a lab', async () => {
    const dto = {
      name: 'Lab 1',
      location: 'Building A',
      equipment: [], // o el valor que corresponda
      reportedBy: 'userId' // o el valor que corresponda
    };
    const result = await controller.create(dto as any);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockLab);
  });
  
  it('should update a lab', async () => {
    const dto = {
      name: 'Updated Lab',
      equipment: [],
      reportedBy: 'userId'
    };
    const result = await controller.update('1', dto as any);
    expect(service.update).toHaveBeenCalledWith(1, dto);
    expect(result).toEqual({ ...mockLab, name: 'Updated Lab' });
  });

  it('should remove a lab', async () => {
    const result = await controller.remove('1');
    expect(service.remove).toHaveBeenCalledWith(1);
    expect(result).toEqual({ message: 'Lab deleted' });
  });
});