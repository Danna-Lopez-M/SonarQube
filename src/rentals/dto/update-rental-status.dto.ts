import { IsIn } from 'class-validator';

export class UpdateRentalStatusDto {
  @IsIn(['pending, approved', 'rejected', 'completed'])
  status: 'pending' | 'approved' | 'rejected' | 'completed';
}