import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity('personal_charge_records')
export class PersonalCharge {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar')
    charge_type: string;

    @Column('int')
    balance_type: number;

    @Column('float')
    charge_num: number;

    @Column('int')
    created_by: number;

    @Column('varchar')
    charge_time: string;

    @Column('int')
    status: number;

    @Column('varchar')
    remark: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}