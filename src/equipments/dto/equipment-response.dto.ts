export class EquipmentResponseDto {
  id: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  description: string;
  price: number;
  stock: number;
  warrantyPeriod: string;
  releaseDate: Date;
  isInRepair: boolean;
  status: 'available' | 'in-repair' | 'out-of-stock';
}