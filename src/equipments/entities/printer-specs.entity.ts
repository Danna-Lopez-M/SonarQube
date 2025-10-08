import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PrinterSpecs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  printTechnology: string;

  @Column('text')
  resolution: string;

  @Column('text')
  connectivity: string;
}
