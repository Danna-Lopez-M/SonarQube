export class CreateContractDto {
  contract_id: string;
  contract_number: string;
  start_date: Date;
  end_date: Date;
  monthly_value: number;
  user_id: string;
}