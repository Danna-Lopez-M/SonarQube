import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-lab.dto';
import { Lab } from './entities/lab.entity';
import { RentalContract } from '../rentals/entities/rental.entity';
import { Contract } from '../contract/entities/contract.entity';
import { Equipment } from '../equipments/entities/equipment.entity';

@Injectable()
export class LabsService {
  constructor(
    @InjectRepository(Lab)
    private readonly labRepo: Repository<Lab>,

    @InjectRepository(RentalContract)
    private readonly rentalRepo: Repository<RentalContract>,

    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,

    @InjectRepository(Equipment)
    private readonly equipmentRepo: Repository<Equipment>,
  ) {}

  async create(createLabDto: CreateLabDto) {
    const lab = this.labRepo.create(createLabDto);
    await this.labRepo.save(lab);
    return { message: 'Laboratorio creado exitosamente', lab };
  }

  async findAll() {
    const labs = await this.labRepo.find({ relations: ['equipment', 'reportedBy'] });
    return { message: 'Laboratorios encontrados', labs };
  }

  async findOne(id: number) {
    const lab = await this.labRepo.findOne({
      where: { id: id.toString() },
      relations: ['equipment', 'reportedBy'],
    });

    if (!lab) throw new NotFoundException(`Lab with ID ${id} not found`);

    return { message: 'Laboratorio encontrado', lab };
  }

  async update(id: number, updateLabDto: UpdateLabDto) {
    const lab = await this.labRepo.findOne({ where: { id: id.toString() } });

    if (!lab) throw new NotFoundException(`Lab with ID ${id} not found`);

    Object.assign(lab, updateLabDto);
    await this.labRepo.save(lab);

    return { message: 'Laboratorio actualizado exitosamente', lab };
  }

  async remove(id: number) {
    const lab = await this.labRepo.findOne({ where: { id : id.toString() } });

    if (!lab) throw new NotFoundException(`Lab with ID ${id} not found`);

    await this.labRepo.remove(lab);

    return { message: 'Laboratorio eliminado exitosamente' };
  }

  async reportBrokenEquipment(userId: string, contractId: string, notes?: string) {
    const contract = await this.rentalRepo.findOne({
      where: { id: contractId },
      relations: ['equipment', 'client'],
    });

    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.client.id !== userId) throw new BadRequestException('Unauthorized report');

    const lab = this.labRepo.create({
      equipment: contract.equipment,
      reportedBy: contract.client,
      notes,
    });
    await this.labRepo.save(lab);

    contract.isDisabled = true;
    await this.rentalRepo.save(contract);

    contract.equipment.isInRepair = true;
    await this.equipmentRepo.save(contract.equipment);

    return { message: 'Equipo reportado y enviado al laboratorio', lab };
  }

  async markAsRepaired(labId: string) {
    const lab = await this.labRepo.findOne({
      where: { id: labId },
      relations: ['equipment'],
    });

    if (!lab) throw new NotFoundException('Lab record not found');

    lab.isRepaired = true;
    await this.labRepo.save(lab);

    lab.equipment.isInRepair = false;
    lab.equipment.stock += 1;

    await this.equipmentRepo.save(lab.equipment);

    return { message: 'Equipo marcado como reparado y disponible nuevamente' };
  }
  
}
