// booklist.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booklist } from './booklist.entity';
import { CreateBooklistDto } from './create-booklist.dto';

@Injectable()
export class BooklistService {
  constructor(
    @InjectRepository(Booklist)
    private booklistRepository: Repository<Booklist>,
  ) {}

  // Create a new book
  create(createBooklistDto: CreateBooklistDto): Promise<Booklist> {
    const book = this.booklistRepository.create(createBooklistDto);
    return this.booklistRepository.save(book);
  }

  // Get all books
  findAll(): Promise<Booklist[]> {
    return this.booklistRepository.find();
  }

  // Update a book by its ID
  async update(id: number, updateBooklistDto: CreateBooklistDto): Promise<Booklist> {
    const book = await this.booklistRepository.findOne({
      where: { id }, // Use where for finding the book
    });
    if (!book) {
      // Fix: Use backticks for string interpolation
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    // Update the properties of the book
    Object.assign(book, updateBooklistDto);
    return this.booklistRepository.save(book); // Save the updated book
  }

  // Delete a book by its ID
  async remove(id: number): Promise<void> {
    const result = await this.booklistRepository.delete(id);
    if (result.affected === 0) {
      // Fix: Use backticks for string interpolation
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
  }

  async findByIsbn(isbn: string) {
  const book = await this.booklistRepository.findOne({ where: { isbn } });
  if (!book) {
    throw new NotFoundException(`Book with ISBN ${isbn} not found`);
  }
  return book;
}
  

}
