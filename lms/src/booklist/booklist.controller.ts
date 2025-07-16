import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { BooklistService } from './booklist.service';
import { CreateBooklistDto } from './create-booklist.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';  // JWT auth guard
import { RolesGuard } from '../auth/roles.guard';        // Roles guard
import { Roles } from '../auth/roles.decorator';         // Roles decorator
import { Role } from '../auth/role.enum';                // Role enum

@Controller('booklist')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BooklistController {
  constructor(private readonly booklistService: BooklistService) {}

  @Post()
  @Roles(Role.Librarian)
  async create(@Body() createBooklistDto: CreateBooklistDto) {
    const newBook = await this.booklistService.create(createBooklistDto);
    return { message: 'Book added successfully'};
  }

  @Get()
  async findAll() {
    return this.booklistService.findAll();
  }

  @Patch(':id')
  @Roles(Role.Librarian)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() createBooklistDto: CreateBooklistDto,
  ) {
    await this.booklistService.update(id, createBooklistDto);
    return { message: `Book with ID ${id} updated successfully` };
  }

  @Delete(':id')
  @Roles(Role.Librarian)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.booklistService.remove(id);
    return { message: `Book with ID ${id} deleted successfully` };
  }

  @Get('search-by-isbn')
  async searchByIsbn(@Query('isbn') isbn: string) {
    return this.booklistService.findByIsbn(isbn);
  }
  
}