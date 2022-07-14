import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity('personal_sort')
export class PersonalSort {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    types_ids_sort: string;

    @Column('int')
    created_by: number;

    @Column('int')
    status: number;

    @Column('int')
    balance_type: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
