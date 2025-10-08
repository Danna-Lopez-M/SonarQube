import { Test, TestingModule } from '@nestjs/testing';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';

describe('ContractController', () => {
  let controller: ContractController;
  let service: ContractService;

  const mockContract = { id: '1', contract_id: 'CTR-1', contract_number: 'CN-1' };
  const mockContracts = [mockContract];

  const mockContractService = {
    findAll: jest.fn().mockResolvedValue(mockContracts),
    findByUser: jest.fn().mockResolvedValue(mockContracts),
    findOne: jest.fn().mockResolvedValue(mockContract),

  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractController],
      providers: [
        { provide: ContractService, useValue: mockContractService },
      ],
    }).compile();

    controller = module.get<ContractController>(ContractController);
    service = module.get<ContractService>(ContractService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all contracts', async () => {
    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockContracts);
  });

  it('should return contracts by user', async () => {
    const userId = 'user-1';
    const result = await controller.findByUser(userId);
    expect(service.findByUser).toHaveBeenCalledWith(userId);
    expect(result).toEqual(mockContracts);
  });

  it('should return one contract', async () => {
    const id = '1';
    const result = await controller.findOne(id);
    expect(service.findOne).toHaveBeenCalledWith(id);
    expect(result).toEqual(mockContract);
  });

  it('should return empty array if no contracts exist', async () => {
    jest.spyOn(service, 'findAll').mockResolvedValueOnce([]);
    const result = await controller.findAll();
    expect(result).toEqual([]);
  });

  it('should return empty array if user has no contracts', async () => {
    jest.spyOn(service, 'findByUser').mockResolvedValueOnce([]);
    const userId = 'user-2';
    const result = await controller.findByUser(userId);
    expect(result).toEqual([]);
  });

  it('should throw if service.findOne throws', async () => {
    jest.spyOn(service, 'findOne').mockRejectedValueOnce(new Error('Not found'));
    await expect(controller.findOne('bad-id')).rejects.toThrow('Not found');
  });

  it('should throw if service.findByUser throws', async () => {
    jest.spyOn(service, 'findByUser').mockRejectedValueOnce(new Error('User not found'));
    await expect(controller.findByUser('bad-user')).rejects.toThrow('User not found');
  });

  it('should throw if service.findAll throws', async () => {
    jest.spyOn(service, 'findAll').mockRejectedValueOnce(new Error('DB error'));
    await expect(controller.findAll()).rejects.toThrow('DB error');
  });

  it('should call findByUser with correct userId', async () => {
    const userId = 'user-123';
    await controller.findByUser(userId);
    expect(service.findByUser).toHaveBeenCalledWith(userId);
  });

  it('should call findOne with correct id', async () => {
    const id = 'contract-123';
    await controller.findOne(id);
    expect(service.findOne).toHaveBeenCalledWith(id);
  });
  
});