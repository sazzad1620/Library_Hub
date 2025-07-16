import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { Booklist } from './booklist/booklist.entity';
import { BooklistModule } from './booklist/booklist.module';

import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';

import { AuthModule } from './auth/auth.module';

import { Transaction } from './transaction/transaction.entity';
import { TransactionsModule } from './transaction/transaction.module';

import { PasswordReset } from './passRes/passRes.entity';
import { PasswordResetModule } from './passRes/passRes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes .env variables globally available
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'mac1728',
      database: process.env.DB_NAME || 'lmsdb',
      entities: [Booklist, User, Transaction, PasswordReset],
      synchronize: true, // Only for dev! Disable in production
    }),
    BooklistModule,
    UsersModule,
    AuthModule,
    TransactionsModule,
    PasswordResetModule,
  ],
})
export class AppModule {}
