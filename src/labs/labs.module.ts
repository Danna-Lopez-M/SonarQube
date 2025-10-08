import { Module } from '@nestjs/common';
import { LabsService } from './labs.service';
import { LabsController } from './labs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lab } from './entities/lab.entity';
import { RentalsModule } from '../rentals/rentals.module'
import { Equipment } from '../equipments/entities/equipment.entity';
import { Auth } from '../auth/decorators/auth.decorator';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lab, Equipment]),
    RentalsModule,
    AuthModule
  ],
  controllers: [LabsController],
  providers: [LabsService],
})
export class LabsModule {}