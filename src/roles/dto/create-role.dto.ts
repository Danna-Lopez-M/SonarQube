import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    description: 'The name of the role',
    example: 'admin',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The description of the role',
    example: 'Administrator role with full access',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'List of permissions for the role',
    example: ['create:roles', 'read:roles', 'update:roles', 'delete:roles'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}