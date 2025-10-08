import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LabsService } from './labs.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { GetUser } from '../auth/decorators/get-user/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-lab.dto';

@Controller('labs')
export class LabsController {
  constructor(private readonly labsService: LabsService) {}

  @Post('report/:contractId')
  @Auth(ValidRoles.client)
  reportEquipment(
    @Param('contractId') contractId: string,
    @GetUser() user: User,
    @Body('notes') notes: string,
  ) {
    return this.labsService.reportBrokenEquipment(user.id, contractId, notes);
  }

  @Patch(':labId/repair')
  @Auth(ValidRoles.technician)
  markAsRepaired(@Param('labId') labId: string) {
    return this.labsService.markAsRepaired(labId);
  }

  @Post()
  create(@Body() createLabDto: CreateLabDto) {
    return this.labsService.create(createLabDto);
  }

  @Get()
  findAll() {
    return this.labsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.labsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLabDto: UpdateLabDto) {
    return this.labsService.update(+id, updateLabDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.labsService.remove(+id);
  }
}
