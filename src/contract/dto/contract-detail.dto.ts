import { Expose, Type } from 'class-transformer';
import { RentalContract } from '../../rentals/entities/rental.entity';
import { User } from '../../users/entities/user.entity';

export class ContractDetailDto {
  @Expose()
  contract_id: string;

  @Expose()
  contract_number: string;

  @Expose()
  start_date: Date;

  @Expose()
  end_date: Date;

  @Expose()
  monthly_value: number;

  @Expose()
  user: {
    id: string;
    name: string;
    email: string;
  };

  @Expose()
  rental: {
    id: string;
    equipmentName: string;
    startDate: Date;
    endDate: Date;
  };
}
