import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity('backlogs')
export class Backlog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar')
    name: string;

    @Column('varchar')
    remark: string;

    @Column('varchar')
    backlog_day: string;

    @Column('int')
    remind: number;

    @Column('int')
    priority: number;

    @Column('int')
    created_by: number;

    @Column('int')
    status: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
