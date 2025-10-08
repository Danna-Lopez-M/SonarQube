import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  TableInheritance,
} from 'typeorm';

import { ComputerSpecs } from './computer-specs.entity';
import { PrinterSpecs } from './printer-specs.entity';
import { PhoneSpecs } from './phone-specs.entity';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class Equipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text')
  type: string;

  @Column('text')
  brand: string;

  @Column('text')
  model: string;

  @Column('text')
  description: string;

  @Column('decimal')
  price: number;

  @Column()
  stock: number;

  @Column('text')
  warrantyPeriod: string;

  @Column({ type: 'date' })
  releaseDate: Date;

  @Column({ type: 'text', nullable: true })
  image?: string;

  @Column({ type: 'boolean', default: false })
  isInRepair: boolean;

  // Relaciones
  @OneToOne(() => ComputerSpecs, { cascade: true, nullable: true })
  @JoinColumn()
  computerSpecs: ComputerSpecs;

  @OneToOne(() => PrinterSpecs, { cascade: true, nullable: true })
  @JoinColumn()
  printerSpecs: PrinterSpecs;

  @OneToOne(() => PhoneSpecs, { cascade: true, nullable: true })
  @JoinColumn()
  phoneSpecs: PhoneSpecs;
}
