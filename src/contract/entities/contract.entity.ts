import { RentalContract } from "../../rentals/entities/rental.entity";
import { User } from "../../users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";

@Entity()
export class Contract {
  @PrimaryColumn()
  contract_id: string;

  @Column()
  contract_number: string;

  @Column()
  start_date: Date;

  @Column()
  end_date: Date;

  @Column('decimal')
  monthly_value: number;

  @ManyToOne(() => User, user => user.contracts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => RentalContract, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rental_id' })
  rental?: RentalContract;
}