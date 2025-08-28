import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Booklist } from '../booklist/booklist.entity';

@Entity('transaction')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Booklist)
  @JoinColumn({ name: 'book_id' })
  book: Booklist;

  @CreateDateColumn({ name: 'transaction_date' })
  transactionDate: Date;

  @Column()
  status: string;
}
