import { Test, TestingModule } from '@nestjs/testing';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';

describe('RentalsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [RentalsController],
      providers: [
        {
          provide: RentalsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
      ],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide RentalsService', () => {
    const service = module.get(RentalsService);
    expect(service).toBeDefined();
  });

  it('should provide RentalsController', () => {
    const controller = module.get(RentalsController);
    expect(controller).toBeDefined();
  });
});