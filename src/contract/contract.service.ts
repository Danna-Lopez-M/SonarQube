import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { User } from '../users/entities/user.entity';
import { RentalContract } from '../rentals/entities/rental.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { ContractDetailDto } from './dto/contract-detail.dto';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,
    ) {

    }

    async createFromRental(user: User, rental: RentalContract): Promise<Contract> {
        const contract = this.contractRepo.create({
        contract_id: `CTR-${Date.now()}`,
        contract_number: `CN-${Math.floor(Math.random() * 10000)}`,
        start_date: rental.startDate,
        end_date: rental.endDate,
        monthly_value: rental.equipment?.price || 0,
        user: user,
        rental: rental,
        });

        return await this.contractRepo.save(contract);
    }

    async findAll(): Promise<Contract[]> {
        return this.contractRepo.find({
            relations: ['user', 'rental'],
        });
    }

    async findByUser(userId: string): Promise<Contract[]> {
        return this.contractRepo.find({
            where: { user: { id: userId } },
            relations: ['rental', 'user'],
        });
    }

    async findOne(id: string, user?: User): Promise<ContractDetailDto> {
        const contract = await this.contractRepo.findOne({
            where: { contract_id: id },
            relations: ['user', 'rental', 'rental.equipment'],
        });

        if (!contract) {
            throw new NotFoundException(`Contract with ID ${id} not found`);
        }

        if (user && user.roles.includes('client') && contract.user.id !== user.id) {
            throw new NotFoundException(`Contract with ID ${id} not found`);
        }

        return plainToInstance(ContractDetailDto, {
            ...contract,
            user: {
            id: contract.user.id,
            name: contract.user.fullName,
            email: contract.user.email,
            },
            rental: {
            id: contract.rental?.id ?? 'N/A',
            equipmentName: contract.rental?.equipment?.name ?? 'N/A',
            startDate: contract.rental?.startDate ?? 'N/A',
            endDate: contract.rental?.endDate ?? 'N/A',
            },
        });
    }
}
