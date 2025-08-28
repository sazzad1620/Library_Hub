import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transaction.controller';
import { TransactionsService } from './transaction.service';
import { Transaction } from './transaction.entity';
import { Booklist } from '../booklist/booklist.entity';
import { User } from '../users/user.entity';  // <-- Add this import

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Booklist, User]), // <-- Add User entity here
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
