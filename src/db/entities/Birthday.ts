import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity('birthdays')
export class Birthday {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar')
    name: string;

    @Column('varchar')
    remark: string;

    @Column('varchar')
    birthday: string;

    @Column('int')
    is_lunar: number;

    @Column('varchar')
    lunar_cn: string;

    @Column('int')
    lunar_year: number;

    @Column('int')
    lunar_month: number;

    @Column('int')
    lunar_day: number;

    @Column('int')
    remind: number;

    @Column('int')
    created_by: number;

    @Column('int')
    status: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
