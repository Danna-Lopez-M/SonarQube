import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EquipmentsService } from './equipments.service';
import { EquipmentsController } from './equipments.controller';
import { Equipment } from './entities/equipment.entity';
import { ComputerSpecs } from './entities/computer-specs.entity';
import { PrinterSpecs } from './entities/printer-specs.entity';
import { PhoneSpecs } from './entities/phone-specs.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Equipment,
      ComputerSpecs,
      PrinterSpecs,
      PhoneSpecs,
    ]),
  ],
  controllers: [EquipmentsController],
  providers: [EquipmentsService],
  exports: [EquipmentsService],
})
export class EquipmentsModule {}
