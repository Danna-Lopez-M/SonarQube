import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EquipmentsService } from './equipments.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { Equipment } from './entities/equipment.entity';
import { EquipmentResponseDto } from './dto/equipment-response.dto';

@Controller('equipments')
export class EquipmentsController {
  constructor(private readonly equipmentsService: EquipmentsService) {}

  @Post()
  create(@Body() createEquipmentDto: CreateEquipmentDto): Promise<Equipment> {
    return this.equipmentsService.create(createEquipmentDto);
  }

  @Get()
  findAll(): Promise<EquipmentResponseDto[]> {
    return this.equipmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Equipment> {
    return this.equipmentsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
  ): Promise<Equipment> {
    return this.equipmentsService.update(id, updateEquipmentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.equipmentsService.remove(id);
  }
}
