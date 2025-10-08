import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Equipment } from '../../equipments/entities/equipment.entity';

@Entity('rental_contracts')
export class RentalContract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  client: User;

  @ManyToOne(() => User, { nullable: true })
  technical: User;

  @ManyToOne(() => Equipment)
  equipment: Equipment;

  @Column('date')
  startDate: Date;

  @Column('date')
  endDate: Date;

  @Column('text', { default: 'pending' })
  status: 'pending' | 'approved' | 'rejected' | 'completed';

  @Column('boolean', { default: false })
  isDisabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column('uuid', { nullable: true })
  approvedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  approvalDate?: Date;

  @Column('boolean', { default: false })
  isDelivered: boolean;

  @Column('text', { nullable: true })
  deliveryNotes?: string;
}