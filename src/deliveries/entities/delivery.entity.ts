import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { RentalContract } from '../../rentals/entities/rental.entity';
import { User } from '../../users/entities/user.entity';


@Entity('deliveries')
export class Delivery {

    @PrimaryGeneratedColumn('uuid')
    id: String;

    @ManyToOne(() => RentalContract, { cascade: true })
    @JoinColumn()
    rental: RentalContract;

    @ManyToOne(() => User, { cascade: true })
    @JoinColumn()
    technician: User;

    @ManyToOne(() => User, { cascade: true })
    @JoinColumn()
    client: User;

    @Column('text', { nullable: true })
    actDocumentUrl?: string;

    @Column('text', { nullable: true })
    clientSignatureUrl?: string;

    @Column('text', { nullable: true })
    visualObservations?: string;

    @Column('text', { nullable: true })
    technicalObservations?: string;

    @Column('text', { default: 'pending' })
    status: 'pending' | 'accepted' | 'rejected' | 'in-review';

    @CreateDateColumn()
    createdAt: Date;

}