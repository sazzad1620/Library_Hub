import { IsString, IsInt } from 'class-validator';

export class CreateBooklistDto {
  @IsString()
  title: string;

  @IsString()
  author_name: string;

  @IsString()
  isbn: string;

  @IsInt()
  quantity: number;

  @IsInt()
  year: number;

  @IsString()
  genre: string;

  @IsString()
  shelf_location: string;
}
