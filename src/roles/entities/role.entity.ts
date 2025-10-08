import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('roles')
@Unique(['name'])
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text', { nullable: false })
  description: string;

  @Column('text', { array: true, default: [] })
  permissions: string[];
}
