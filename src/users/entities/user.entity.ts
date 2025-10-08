import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RentalContract } from '../../rentals/entities/rental.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  fullName: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text', { select: false })
  password?: string;

  @Column('text', { nullable: true })
  dni?: string;

  @Column('text', { nullable: true })
  phone?: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @Column('text', { array: true, default: ['client'] })
  roles: string[];

  @OneToMany(() => RentalContract, contract => contract.client)
  contracts: RentalContract[];

}