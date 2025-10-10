import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ForbiddenException,
  Logger 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';

import { RentalContract } from './entities/rental.entity';
import { CreateRentalDto } from './dto/create-rental.dto';
import { EquipmentsService } from '../equipments/equipments.service';
import { User } from '../users/entities/user.entity';
import { UpdateRentalStatusDto } from './dto/update-rental-status.dto';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { FilterRentalsDto } from './dto/filter-rental.dto';
import { Contract } from '../contract/entities/contract.entity';
import { ContractService } from '../contract/contract.service';

@Injectable()
export class RentalsService {
  private readonly logger = new Logger(RentalsService.name);
  
  constructor(
    @InjectRepository(RentalContract)
    private readonly rentalRepository: Repository<RentalContract>,

    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,
    private readonly equipmentService: EquipmentsService,
    private readonly contractService: ContractService,
  ) {}

  async createRequest(clientId: string, createRentalDto: CreateRentalDto) {
    const equipment = await this.equipmentService.findOne(createRentalDto.equipmentId);

    if (equipment.isInRepair) {
      throw new BadRequestException('This equipment is currently under repair');
    } 

    if (equipment.stock < 1) {
      throw new BadRequestException('Equipment out of stock');
    }

    if (createRentalDto.endDate <= createRentalDto.startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const rentalContract = this.rentalRepository.create({
      client: { id: clientId },
      equipment: { id: equipment.id },
      startDate: createRentalDto.startDate,
      endDate: createRentalDto.endDate,
      status: 'pending',
    });

    const savedRental = await this.rentalRepository.save(rentalContract);

    const contract = await this.contractService.createFromRental({ id: clientId } as User, savedRental);

    await this.contractRepo.save(contract);

    await this.equipmentService.updateStock(equipment.id, equipment.stock - 1);

    return { rentalContract: savedRental, contract };
  }

  async findByClient(clientId: string): Promise<RentalContract[]> {
    return this.rentalRepository.find({
      where: { client: { id: clientId } },
      relations: ['equipment'],
    });
  }

  async findAll(filterDto: FilterRentalsDto): Promise<RentalContract[]> {
    const { status, startDate, endDate } = filterDto;
    
    const where: any = {};
    if (status) where.status = status;
    if (startDate && endDate) {
      where.startDate = Between(startDate, endDate);
    } else if (startDate) {
      where.startDate = MoreThanOrEqual(startDate);
    }

    return this.rentalRepository.find({
      where,
      relations: ['client', 'equipment'],
    });
  }

  async updateStatus(
    id: string, 
    updateDto: UpdateRentalStatusDto,
    user: User,
  ): Promise<RentalContract> {
    const contract = await this.rentalRepository.findOne({
      where: { id },
      relations: ['equipment'],
    });

    if (!contract) throw new NotFoundException('Contract not found');

    if (
      !user.roles.includes(ValidRoles.admin) && 
      !user.roles.includes(ValidRoles.salesperson)
    ) {
      throw new ForbiddenException('Unauthorized to update status');
    }

    if (updateDto.status === 'approved' && contract.status === 'pending') {
    } else if (updateDto.status === 'rejected') {
      await this.equipmentService.updateStock(
        contract.equipment.id, 
        contract.equipment.stock + 1
      );
    }

    contract.status = updateDto.status;
    return this.rentalRepository.save(contract);
  }

  async getActiveDeliveries(): Promise<RentalContract[]> {
    return this.rentalRepository.find({
      where: { 
        status: 'approved',
        startDate: MoreThanOrEqual(new Date()), 
      },
      relations: ['client', 'equipment'],
    });
  }

  async getRentalMetrics(): Promise<{
    active: number;
    pending: number;
    revenue: number;
  }> {
    const [active, pending] = await Promise.all([
      this.rentalRepository.count({ where: { status: 'approved' } }),
      this.rentalRepository.count({ where: { status: 'pending' } }),
    ]);

    const revenueResult = await this.rentalRepository
      .createQueryBuilder('rental')
      .select('SUM(equipment.price)', 'revenue')
      .leftJoin('rental.equipment', 'equipment')
      .where('rental.status = :status', { status: 'approved' })
      .getRawOne();

    return {
      active,
      pending,
      revenue: Number(revenueResult.revenue) || 0,
    };
  }
}