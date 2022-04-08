import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity('teams')
export class Team {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar')
    members: string;

    @Column('int')
    members_num: number;

    @Column('varchar')
    name: string;

    @Column('varchar')
    primary_key: string;

    @Column('int')
    owner: number;

    @Column('int')
    status: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}