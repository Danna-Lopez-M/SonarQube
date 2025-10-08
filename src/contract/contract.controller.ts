import {
  Controller,
  Get,
  Param
} from '@nestjs/common';

import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user/get-user.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { User } from '../users/entities/user.entity';
import { ContractService } from './contract.service';

@Controller('contracts')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

    @Get()
    @Auth(ValidRoles.admin, ValidRoles.salesperson)
    findAll() {
        return this.contractService.findAll();
    }

    @Get('my')
    @Auth(ValidRoles.client)
    findMyContracts(@GetUser() user: User) {
        return this.contractService.findByUser(user.id);
    }

    
    @Get(':id')
    @Auth(ValidRoles.client)
    findOne(@Param('id') id: string, @GetUser() user: User) {
        return this.contractService.findOne(id, user);
    }
}
