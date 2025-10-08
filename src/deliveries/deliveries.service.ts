import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { Delivery } from './entities/delivery.entity';

@Injectable()
export class DeliveriesService {

  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepo: Repository<Delivery>,
  ){}

  async create(createDeliveryDto: CreateDeliveryDto) {
    console.log('typeof rental:', typeof createDeliveryDto.rental);
    console.log('instanceof rental:', createDeliveryDto.rental instanceof Object);
    console.log('DTO recibido:', JSON.stringify(createDeliveryDto, null, 2));

    // Verifica estructura profunda
    if (!createDeliveryDto.rental?.id) {
      throw new BadRequestException('El campo rental.id es requerido');
    }
    if (!createDeliveryDto.technician || !createDeliveryDto.technician.id) {
      throw new BadRequestException('El campo technician.id es requerido');
    }
    if (!createDeliveryDto.client || !createDeliveryDto.client.id) {
      throw new BadRequestException('El campo client.id es requerido');
    }

    const delivery = this.deliveryRepo.create({
      rental: { id: createDeliveryDto.rental.id },
      technician: { id: createDeliveryDto.technician.id },
      client: { id: createDeliveryDto.client.id },
      actDocumentUrl: createDeliveryDto.actDocumentUrl,
      clientSignatureUrl: createDeliveryDto.clientSignatureUrl,
      visualObservations: createDeliveryDto.visualObservations,
      technicalObservations: createDeliveryDto.technicalObservations
    });

    await this.deliveryRepo.save(delivery);
    return { message: 'Entrega creada exitosamente', delivery };
  }
  

  findAll() {
    return this.deliveryRepo.find({ relations: ['rental', 'technician', 'client'] });
  }

  async findOne(id: string) {
    const delivery = await this.deliveryRepo.findOne({
      where: { id },
      relations: ['rental', 'technician', 'client'],
    });
    if (!delivery) throw new NotFoundException('Delivery not found');
    return delivery;
  }

  async update(id: string, updateDeliveryDto: UpdateDeliveryDto) {
    const delivery = await this.deliveryRepo.findOne({ where: { id } });
    if (!delivery) throw new NotFoundException('Delivery not found');
    Object.assign(delivery, updateDeliveryDto);
    await this.deliveryRepo.save(delivery);
    // Notificar si el estado cambia
    return { message: 'Entrega/Devolución actualizada', delivery };
  }

  async remove(id: string) {
    const delivery = await this.deliveryRepo.findOne({ where: { id } });
    if (!delivery) throw new NotFoundException('Delivery not found');
    await this.deliveryRepo.remove(delivery);
    return { message: 'Deleted record' };
  }
  
}
