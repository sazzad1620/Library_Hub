import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('booklist') // match your SQL table name
export class Booklist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  author_name: string;

  @Column()
  isbn: string;

  @Column()
  quantity: number;

  @Column()
  year: number;

  @Column()
  genre: string;

  @Column()
  shelf_location: string;
}
