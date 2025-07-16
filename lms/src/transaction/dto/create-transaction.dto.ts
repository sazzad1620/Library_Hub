import { IsInt, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsInt()
  bookId: number;

  @IsOptional()
  @IsInt()
  userId?: number;  // Added optional userId
}
