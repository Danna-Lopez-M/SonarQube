import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  Patch, 
  Query,
  UnauthorizedException,
} from '@nestjs/common';

import { RentalsService } from './rentals.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { GetUser } from '../auth/decorators/get-user/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { UpdateRentalStatusDto } from './dto/update-rental-status.dto';
import { FilterRentalsDto } from './dto/filter-rental.dto';

@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Post('request')
  @Auth(ValidRoles.client, ValidRoles.admin)
  createRequest(
    @Body() createRentalDto: CreateRentalDto,
    @GetUser() client: User,
  ) {
    return this.rentalsService.createRequest(client.id, createRentalDto);
  }

  @Get('my-contracts')
  @Auth(ValidRoles.client, ValidRoles.admin)
  findMyContracts(@GetUser() client: User) {
    return this.rentalsService.findByClient(client.id);
  }

  @Get('')
  @Auth(ValidRoles.admin, ValidRoles.salesperson)
  findAll(@Query() filterDto: FilterRentalsDto) {
    return this.rentalsService.findAll(filterDto);
  }

  @Patch(':id/status')
  @Auth(ValidRoles.admin, ValidRoles.salesperson)
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateRentalStatusDto,
    @GetUser() user: User,
  ) {
    return this.rentalsService.updateStatus(id, updateDto, user);
  }

  @Get('active-deliveries')
  @Auth(ValidRoles.technician, ValidRoles.admin)
  getActiveDeliveries() {
    return this.rentalsService.getActiveDeliveries();
  }

  @Get('metrics')
  @Auth(ValidRoles.admin, ValidRoles.salesperson)
  getMetrics() {
    return this.rentalsService.getRentalMetrics();
  }
}