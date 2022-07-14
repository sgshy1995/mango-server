import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity('team_sort')
export class TeamSort {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    types_ids_sort: string;

    @Column('int')
    team_id: number;

    @Column('int')
    balance_type: number;

    @Column('int')
    status: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
