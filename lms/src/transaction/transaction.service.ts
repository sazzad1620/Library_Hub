import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { Booklist } from '../booklist/booklist.entity';
import { User } from '../users/user.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Booklist)
    private booklistRepository: Repository<Booklist>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async borrowBook(userId: number, bookId: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      const book = await this.booklistRepository.findOne({ where: { id: bookId } });
      if (!book) throw new NotFoundException('Book not found');
      if (book.quantity <= 0) throw new BadRequestException('Book is not available');

      const transaction = this.transactionRepository.create({
        user: { id: user.id },
        book: { id: book.id },
        status: 'Borrowed',
      });

      console.log('Transaction entity to save:', transaction);
      await this.transactionRepository.save(transaction);

      book.quantity -= 1;
      await this.booklistRepository.save(book);

      return transaction;
    } catch (error) {
      console.error('🔥 ERROR in borrowBook:', error);
      throw error;
    }
  }

  async createBorrowRequest(userId: number, bookId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const book = await this.booklistRepository.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Book not found');

    const transaction = this.transactionRepository.create({
      user: { id: user.id },
      book: { id: book.id },
      status: 'Requested',
    });

    await this.transactionRepository.save(transaction);

    return {
      message: 'Borrow request submitted successfully',
      transaction,
    };
  }

  async getBorrowRequests() {
    return this.transactionRepository.find({
      where: { status: 'Requested' },
      relations: ['user', 'book'],
    });
  }

  async approveBorrowRequest(transactionId: number) {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['user', 'book'],
    });

    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.status !== 'Requested') {
      throw new BadRequestException('Transaction is not a pending request');
    }

    if (transaction.book.quantity <= 0) {
      throw new BadRequestException('Book is out of stock');
    }

    transaction.status = 'Borrowed';
    await this.transactionRepository.save(transaction);

    transaction.book.quantity -= 1;
    await this.booklistRepository.save(transaction.book);

    return {
      message: 'Borrow request approved. Book marked as borrowed.',
      transaction,
    };
  }

  async rejectBorrowRequest(transactionId: number) {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['user', 'book'],
    });

    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.status !== 'Requested') {
      throw new BadRequestException('Transaction is not a pending request');
    }

    transaction.status = 'Rejected';
    await this.transactionRepository.save(transaction);

    return {
      message: 'Borrow request rejected.',
      transaction,
    };
  }

  async getUserTransactions(userId: number) {
    return this.transactionRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'book'],
    });
  }
  async getAllTransactions(page = 1, limit = 10) {
  const [result, total] = await this.transactionRepository.findAndCount({
    relations: ['user', 'book'],
    skip: (page - 1) * limit,
    take: limit,
    order: { id: 'DESC' },
  });

  return {
    transactions: result,
    totalPages: Math.ceil(total / limit),
  };
}

   async updateTransactionStatus(id: number, newStatus: string) {
    const tx = await this.transactionRepository.findOne({
      where: { id },
      relations: ['user', 'book'],
    });

    if (!tx) throw new NotFoundException('Transaction not found');

    // Borrowed → Returned
    if (tx.status === 'Borrowed' && newStatus === 'Returned') {
      tx.book.quantity += 1;
      await this.booklistRepository.save(tx.book);
    }

    // Returned → Borrowed
    if (tx.status === 'Returned' && newStatus === 'Borrowed') {
      if (tx.book.quantity <= 0) {
        throw new BadRequestException('Book is out of stock');
      }
      tx.book.quantity -= 1;
      await this.booklistRepository.save(tx.book);
    }

    // Returned → Overdue
    if (tx.status === 'Returned' && newStatus === 'Overdue') {
      if (tx.book.quantity <= 0) {
        throw new BadRequestException('Book is out of stock');
      }
      tx.book.quantity -= 1;
      await this.booklistRepository.save(tx.book);
    }

    // Overdue → Returned
    if (tx.status === 'Overdue' && newStatus === 'Returned') {
      tx.book.quantity += 1;
      await this.booklistRepository.save(tx.book);
    }

    // Overdue → Rejected
    if (tx.status === 'Overdue' && newStatus === 'Rejected') {
      tx.book.quantity += 1;
      await this.booklistRepository.save(tx.book);
    }

    // Rejected → Overdue
    if (tx.status === 'Rejected' && newStatus === 'Overdue') {
      if (tx.book.quantity <= 0) {
        throw new BadRequestException('Book is out of stock');
      }
      tx.book.quantity -= 1;
      await this.booklistRepository.save(tx.book);
    }

    // Overdue → Requested
    if (tx.status === 'Overdue' && newStatus === 'Requested') {
      tx.book.quantity += 1;
      await this.booklistRepository.save(tx.book);
    }

    // Requested → Overdue
    if (tx.status === 'Requested' && newStatus === 'Overdue') {
      if (tx.book.quantity <= 0) {
        throw new BadRequestException('Book is out of stock');
      }
      tx.book.quantity -= 1;
      await this.booklistRepository.save(tx.book);
    }

    // Rejected → Borrowed
    if (tx.status === 'Rejected' && newStatus === 'Borrowed') {
      if (tx.book.quantity <= 0) {
        throw new BadRequestException('Book is out of stock');
      }
      tx.book.quantity -= 1;
      await this.booklistRepository.save(tx.book);
    }

    // Requested → Borrowed
    if (tx.status === 'Requested' && newStatus === 'Borrowed') {
      if (tx.book.quantity <= 0) {
        throw new BadRequestException('Book is out of stock');
      }
      tx.book.quantity -= 1;
      await this.booklistRepository.save(tx.book);
    }

    // Borrowed → Requested
    if (tx.status === 'Borrowed' && newStatus === 'Requested') {
      tx.book.quantity += 1;
      await this.booklistRepository.save(tx.book);
    }

    // Borrowed → Rejected
    if (tx.status === 'Borrowed' && newStatus === 'Rejected') {
      tx.book.quantity += 1;
      await this.booklistRepository.save(tx.book);
    }

    // Other transitions have no quantity impact:
    // Rejected → Requested → NO quantity change
    // Requested → Rejected → NO quantity change
    // Returned → Requested → NO quantity change
    // Requested → Returned → NO quantity change

    tx.status = newStatus;
    await this.transactionRepository.save(tx);

    return {
      message: `Transaction status updated to ${newStatus}`,
      transaction: tx,
    };
  }
  async getLibrarianSummary() {
    const totalBooks = await this.booklistRepository.count();
    const totalStudents = await this.userRepository.count({
      where: { role: 'student' },
    });

    const borrowedCount = await this.transactionRepository.count({
      where: { status: 'Borrowed' },
    });

    const returnedCount = await this.transactionRepository.count({
      where: { status: 'Returned' },
    });

    const overdueCount = await this.transactionRepository.count({
      where: { status: 'Overdue' },
    });

    return {
      totalBooks,
      totalStudents,
      borrowedCount,
      returnedCount,
      overdueCount,
    };
  }

 async getTopBorrowedBooks() {
    return await this.transactionRepository
      .createQueryBuilder("t")
      .innerJoin("t.book", "book")
      .select([
        "book.id AS id",
        "book.title AS title",
        "COUNT(t.id) AS borrow_count",
      ])
      .where("t.status = :status", { status: "Borrowed" })
      .groupBy("book.id, book.title")
      .orderBy("borrow_count", "DESC")
      .limit(3)
      .getRawMany();
  }


  async getLibrarianTodo() {
    const pendingRequestsCount = await this.transactionRepository.count({
      where: { status: 'Requested' },
    });

    return {
      pendingRequestsCount,
    };
  }

}