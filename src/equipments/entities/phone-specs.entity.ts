import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PhoneSpecs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  screenSize: string;

  @Column('text')
  battery: string;

  @Column('text')
  camera: string;

  @Column('text')
  os: string;
}
