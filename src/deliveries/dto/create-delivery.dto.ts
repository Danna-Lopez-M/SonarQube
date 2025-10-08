import { IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class RelationDto {
    @IsUUID('4')
    id: string;
}

export class CreateDeliveryDto {
    @ValidateNested()
    @Type(() => RelationDto)
    rental: RelationDto;

    @ValidateNested()
    @Type(() => RelationDto)
    technician: RelationDto;

    @ValidateNested()
    @Type(() => RelationDto)
    client: RelationDto;

    @IsOptional()
    @IsString()
    actDocumentUrl?: string;

    @IsOptional()
    @IsString()
    clientSignatureUrl?: string;

    @IsOptional()
    @IsString()
    visualObservations?: string;

    @IsOptional()
    @IsString()
    technicalObservations?: string;
}