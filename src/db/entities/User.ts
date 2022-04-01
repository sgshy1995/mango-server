import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar')
    username: string;

    @Column('varchar')
    nickname: string;

    @Column('text')
    avatar: string | null | undefined;

    @Column('varchar')
    password: string;

    @Column('int')
    gender: number;

    @Column('varchar')
    birthday: string;

    @Column('varchar')
    phone: string;

    @Column('varchar')
    email: string;

    @Column('int')
    status: number;

    @Column('varchar')
    primary_key: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}