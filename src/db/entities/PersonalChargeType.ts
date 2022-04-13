import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity('personal_charge_types')
export class PersonalChargeType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar')
    name: string;

    @Column('varchar')
    realname: string;

    @Column('text')
    icon: string;

    @Column('varchar')
    created_type: string;

    @Column('int')
    created_by: number;

    @Column('int')
    balance_type: number;

    @Column('int')
    status: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}