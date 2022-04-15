import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity('team_charge_records')
export class TeamCharge {
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

    @Column('int')
    team_id: number;

    @Column('timestamp')
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