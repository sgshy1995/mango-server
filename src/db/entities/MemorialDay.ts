import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity('memorial_days')
export class MemorialDay {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar')
    memorial_name: string;

    @Column('varchar')
    memorial_remark: string;

    @Column('varchar')
    memorial_day: string;

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
