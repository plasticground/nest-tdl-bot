import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @Column({ unique: true, type: "numeric" })
  chat_id: number

  @Index()
  @Column()
  title: string

  @Index()
  @Column()
  isActive: boolean

  @Column({ nullable: true, unique: true, type: "numeric" })
  photo_id: number

  @Column({ nullable: true, unique: true })
  photo_path: string

  @Column({ nullable: true, default: null, type: "bigint" })
  added_at: number

  @Column({ nullable: true, default: null, type: "bigint" })
  left_at: number
}