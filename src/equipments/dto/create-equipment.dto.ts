import {
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ComputerSpecsDto {
  @IsString()
  processor: string;

  @IsString()
  ram: string;

  @IsString()
  storage: string;

  @IsString()
  os: string;
}

export class PrinterSpecsDto {
  @IsString()
  printTechnology: string;

  @IsString()
  resolution: string;

  @IsString()
  connectivity: string;
}

export class PhoneSpecsDto {
  @IsString()
  screenSize: string;

  @IsString()
  battery: string;

  @IsString()
  camera: string;

  @IsString()
  os: string;
}

export class CreateEquipmentDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsNumber()
  stock: number;

  @IsString()
  warrantyPeriod: string;

  @IsString()
  releaseDate: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ComputerSpecsDto)
  computerSpecs?: ComputerSpecsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PrinterSpecsDto)
  printerSpecs?: PrinterSpecsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PhoneSpecsDto)
  phoneSpecs?: PhoneSpecsDto;
}
