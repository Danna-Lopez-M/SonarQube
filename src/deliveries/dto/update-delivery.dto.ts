import { PartialType } from '@nestjs/swagger';
import { CreateDeliveryDto } from './create-delivery.dto';
import { IsOptional, IsIn, IsString } from 'class-validator';

export class UpdateDeliveryDto extends PartialType(CreateDeliveryDto) {
    @IsOptional()
    @IsIn(['pending', 'accepted', 'rejected', 'in-review'])
    status?: 'pending' | 'accepted' | 'rejected' | 'in-review';

    @IsOptional()
    @IsString()
    technicalObservations?: string;

}
