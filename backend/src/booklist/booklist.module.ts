import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booklist } from './booklist.entity';
import { BooklistService } from './booklist.service';
import { BooklistController } from './booklist.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Booklist])],
  providers: [BooklistService],
  controllers: [BooklistController],
})
export class BooklistModule {}
