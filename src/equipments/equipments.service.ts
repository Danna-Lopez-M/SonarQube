import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Equipment } from './entities/equipment.entity';
import { ComputerSpecs } from './entities/computer-specs.entity';
import { PrinterSpecs } from './entities/printer-specs.entity';
import { PhoneSpecs } from './entities/phone-specs.entity';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { EquipmentResponseDto } from './dto/equipment-response.dto';

@Injectable()
export class EquipmentsService {
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepo: Repository<Equipment>,

    @InjectRepository(ComputerSpecs)
    private readonly computerSpecsRepo: Repository<ComputerSpecs>,

    @InjectRepository(PrinterSpecs)
    private readonly printerSpecsRepo: Repository<PrinterSpecs>,

    @InjectRepository(PhoneSpecs)
    private readonly phoneSpecsRepo: Repository<PhoneSpecs>,
  ) {}

  async create(createEquipmentDto: CreateEquipmentDto): Promise<Equipment> {
    const equipment = new Equipment();
    const { computerSpecs, printerSpecs, phoneSpecs, ...equipmentData } = createEquipmentDto;
    Object.assign(equipment, equipmentData);

    if (createEquipmentDto.releaseDate) {
        equipment.releaseDate = new Date(createEquipmentDto.releaseDate);
    }

    switch (createEquipmentDto.type.toLowerCase()) {
        case 'computer':
            if (computerSpecs) {
                const compSpec = this.computerSpecsRepo.create(computerSpecs);
                equipment.computerSpecs = await this.computerSpecsRepo.save(compSpec);
            }
            break;

        case 'printer':
            if (printerSpecs) {
                const printerSpec = this.printerSpecsRepo.create(printerSpecs);
                equipment.printerSpecs = await this.printerSpecsRepo.save(printerSpec);
            }
            break;

        case 'phone':
            if (phoneSpecs) {
                const phoneSpec = this.phoneSpecsRepo.create(phoneSpecs);
                equipment.phoneSpecs = await this.phoneSpecsRepo.save(phoneSpec);
            }
            break;

        default:
            throw new Error('Tipo de equipo no soportado');
    }

    return this.equipmentRepo.save(equipment);
  }

  async findAll(): Promise<EquipmentResponseDto[]> {
    const equipments = await this.equipmentRepo.find({
      relations: ['computerSpecs', 'printerSpecs', 'phoneSpecs'],
    });

    return equipments.map(e => this.toResponseDto(e));
  }

  async findOne(id: string): Promise<Equipment> {
    const equipment = await this.equipmentRepo.findOne({
      where: { id },
      relations: ['computerSpecs', 'printerSpecs', 'phoneSpecs'],
    });

    if (!equipment) {
      throw new Error('Equipment not found');
    }

    return equipment;
  }

  async update(id: string, data: any): Promise<Equipment> {
    const equipment = await this.equipmentRepo.findOne({
      where: { id },
      relations: ['computerSpecs', 'printerSpecs', 'phoneSpecs'],
    });

    if (!equipment) {
      throw new Error('Equipo no encontrado');
    }

    Object.assign(equipment, data);

    switch (equipment.type) {
      case 'computer':
        if (equipment.computerSpecs) {
          Object.assign(equipment.computerSpecs, data.specifications);
          await this.computerSpecsRepo.save(equipment.computerSpecs);
        }
        break;

      case 'printer':
        if (equipment.printerSpecs) {
          Object.assign(equipment.printerSpecs, data.specifications);
          await this.printerSpecsRepo.save(equipment.printerSpecs);
        }
        break;

      case 'phone':
        if (equipment.phoneSpecs) {
          Object.assign(equipment.phoneSpecs, data.specifications);
          await this.phoneSpecsRepo.save(equipment.phoneSpecs);
        }
        break;
    }

    return this.equipmentRepo.save(equipment);
  }

  async remove(id: string): Promise<void> {
    const equipment = await this.equipmentRepo.findOne({
      where: { id },
      relations: ['computerSpecs', 'printerSpecs', 'phoneSpecs'],
    });

    if (!equipment) {
      throw new Error('Equipo no encontrado');
    }

    switch (equipment.type) {
      case 'computer':
        if (equipment.computerSpecs) {
          await this.computerSpecsRepo.remove(equipment.computerSpecs);
        }
        break;

      case 'printer':
        if (equipment.printerSpecs) {
          await this.printerSpecsRepo.remove(equipment.printerSpecs);
        }
        break;

      case 'phone':
        if (equipment.phoneSpecs) {
          await this.phoneSpecsRepo.remove(equipment.phoneSpecs);
        }
        break;
    }

    await this.equipmentRepo.remove(equipment);
  }

  async updateStock(id: string, newStock: number): Promise<Equipment> {
      const equipment = await this.equipmentRepo.findOne({ where: { id } });
      
      if (!equipment) {
          throw new Error('Equipment not found');
      }

      equipment.stock = newStock;
      return this.equipmentRepo.save(equipment);
  }

  private toResponseDto(equipment: Equipment): EquipmentResponseDto {
    let status: EquipmentResponseDto['status'];

    if (equipment.isInRepair) {
      status = 'in-repair';
    } else if (equipment.stock < 1) {
      status = 'out-of-stock';
    } else {
      status = 'available';
    }

    return {
      ...equipment,
      status,
    };
  }
}
