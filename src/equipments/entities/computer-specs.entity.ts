import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ComputerSpecs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  processor: string;

  @Column('text')
  ram: string;

  @Column('text')
  storage: string;

  @Column('text')
  os: string;
}
