import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { ContractModule } from '../contract/contract.module';
import { Contract } from '../contract/entities/contract.entity';
import { EquipmentsModule } from '../equipments/equipments.module';
import { UsersModule } from '../users/users.module';
import { RentalContract } from './entities/rental.entity';
import { RentalsController } from './rentals.controller';
import { RentalsService } from './rentals.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      RentalContract,
      Contract,
    ]),
    EquipmentsModule,
    ContractModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [RentalsController],
  providers: [RentalsService],
  exports: [TypeOrmModule],
})
export class RentalsModule {}
