import { Test, TestingModule } from '@nestjs/testing';
import { ContractService } from './contract.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';

describe('ContractService', () => {
  let service: ContractService;

  const mockContract = { id: '1', contract_id: 'CTR-1', contract_number: 'CN-1' };
  const mockContracts = [mockContract];

  const mockContractRepo = {
    create: jest.fn().mockReturnValue(mockContract),
    save: jest.fn().mockResolvedValue(mockContract),
    find: jest.fn().mockResolvedValue(mockContracts),
    findOne: jest.fn().mockResolvedValue(mockContract),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractService,
        {
          provide: getRepositoryToken(Contract),
          useValue: mockContractRepo,
        },
      ],
    }).compile();

    service = module.get<ContractService>(ContractService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all contracts', async () => {
    const result = await service.findAll();
    expect(mockContractRepo.find).toHaveBeenCalled();
    expect(result).toEqual(mockContracts);
  });

  it('should return one contract', async () => {
    const result = await service.findOne('1');
    expect(mockContractRepo.findOne).toHaveBeenCalledWith({ where: { contract_id: '1' }, relations: ['user', 'rental'] });
    expect(result).toEqual(mockContract);
  });

  it('should create a contract from rental', async () => {
    const user = { id: 'u1' } as any;
    const rental = { startDate: new Date(), endDate: new Date(), equipment: { price: 100 } } as any;
    const result = await service.createFromRental(user, rental);
    expect(mockContractRepo.create).toHaveBeenCalled();
    expect(mockContractRepo.save).toHaveBeenCalledWith(mockContract);
    expect(result).toEqual(mockContract);
  });
  
  it('should return contracts by user', async () => {
    mockContractRepo.find.mockResolvedValueOnce([mockContract]);
    const result = await service.findByUser('u1');
    expect(mockContractRepo.find).toHaveBeenCalledWith({
      where: { user: { id: 'u1' } },
      relations: ['rental', 'user'],
    });
    expect(result).toEqual([mockContract]);
  });

  it('should throw NotFoundException if contract not found', async () => {
    mockContractRepo.findOne.mockResolvedValueOnce(undefined);
    await expect(service.findOne('notfound')).rejects.toThrow('Contract with ID notfound not found');
  });

  it('should create contract with monthly_value 0 if rental has no equipment', async () => {
    const user = { id: 'u2' } as any;
    const rental = { startDate: new Date(), endDate: new Date() } as any;
    await service.createFromRental(user, rental);
    expect(mockContractRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ monthly_value: 0, user, rental })
    );
  });
  
});