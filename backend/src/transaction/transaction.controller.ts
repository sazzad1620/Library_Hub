import { Controller, Post, Body, UseGuards, Request, Get, Param, Patch, UnauthorizedException, Query } from '@nestjs/common';
import { TransactionsService } from './transaction.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('borrow')
  async borrow(@Request() req, @Body() createTransactionDto: CreateTransactionDto) {
    console.log('👉 req.user in controller:', req.user);
    console.log('👉 bookId in body:', createTransactionDto.bookId);

    return this.transactionsService.borrowBook(
      req.user.id,
      createTransactionDto.bookId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('request')
  async requestBorrow(@Request() req, @Body() createTransactionDto: CreateTransactionDto) {
    console.log('👉 req.user in controller:', req.user);
    console.log('👉 bookId in body:', createTransactionDto.bookId);

    return this.transactionsService.createBorrowRequest(
      req.user.id,
      createTransactionDto.bookId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('requests')
  async getBorrowRequests() {
    return this.transactionsService.getBorrowRequests();
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('approve/:id')
  async approveBorrow(@Param('id') id: number) {
    return this.transactionsService.approveBorrowRequest(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('reject/:id')
  async rejectBorrow(@Param('id') id: number) {
    return this.transactionsService.rejectBorrowRequest(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getTransactions(@Request() req) {
    return this.transactionsService.getUserTransactions(req.user.id);
  }
  @UseGuards(AuthGuard('jwt'))
@Get('all')
async getAllTransactions(
  @Request() req,
  @Query('page') page = '1',
  @Query('limit') limit = '10',
) {
  if (req.user.role !== 'librarian' && req.user.role !== 'admin') {
    throw new UnauthorizedException('Access denied');
  }

  return this.transactionsService.getAllTransactions(
    parseInt(page),
    parseInt(limit),
  );
}


  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: number,
    @Body() body: { status: string },
  ) {
    return this.transactionsService.updateTransactionStatus(id, body.status);
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('librarian-summary')
  async getLibrarianSummary(@Request() req) {
    if (req.user.role !== 'librarian') {
      throw new UnauthorizedException('Access denied');
    }
    return this.transactionsService.getLibrarianSummary();
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('top-books')
  async getTopBooks(@Request() req) {
    if (req.user.role !== 'librarian' && req.user.role !== 'admin') {
      throw new UnauthorizedException('Access denied');
    }
    return this.transactionsService.getTopBorrowedBooks();
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('todo')
  async getTodo(@Request() req) {
    if (req.user.role !== 'librarian' && req.user.role !== 'admin') {
      throw new UnauthorizedException('Access denied');
    }
    return this.transactionsService.getLibrarianTodo();
  }

}
