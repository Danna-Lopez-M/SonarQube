import { Type } from 'class-transformer';
import { IsDate, IsUUID } from 'class-validator';

export class CreateRentalDto {
  @IsUUID()
  equipmentId: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;
}
