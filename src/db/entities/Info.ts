import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity('infos')
export class Info {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('int')
    user_id: number;

    @Column('text')
    money_background: string;

    @Column('text')
    money_avatar: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}