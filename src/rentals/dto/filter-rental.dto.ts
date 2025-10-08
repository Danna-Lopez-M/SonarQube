import { IsOptional, IsDateString, IsIn } from 'class-validator';

export class FilterRentalsDto {
  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected', 'completed'])
  status?: string;

  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;
}