'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import toast from "react-hot-toast";


interface Book {
  id: number;
  title: string;
  author_name: string;
  isbn: string;
  quantity: number;
  year: number;
  genre: string;
  shelf_location: string;
}

interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

const BookListPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      setRole(decoded.role);
    } catch (err) {
      console.error('Invalid token');
      window.location.href = '/login';
      return;
    }

    const fetchBooks = async () => {
      try {
        const res = await axios.get('http://localhost:3000/booklist', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBooks(res.data);
      } catch (err) {
        console.error('Failed to fetch books:', err);
        window.location.href = '/login';
      }
    };

    fetchBooks();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm('Are you sure you want to delete this book?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:3000/booklist/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setBooks((prev) => prev.filter((book) => book.id !== id));
      toast.success("Book deleted successfully");
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to delete book';
      toast.error(message);
    }
  };

  

const handleBorrowRequest = async (bookId: number) => {
  const token = localStorage.getItem('token');
  if (!token) {
    toast.error("You must be logged in");
    return;
  }

  try {
    await axios.post(
      'http://localhost:3000/transactions/request',
      { bookId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    toast.success("Borrow request submitted to librarian.");
  } catch (error: any) {
    toast.error(error?.response?.data?.message || 'Failed to request borrow');
  }
};

  return (
    <div className="p-8">
      <div className="bg-gray-800/80 p-8 rounded-lg shadow-lg text-white">
      <h2 className="text-3xl font-bold mb-6 text-white">Book List</h2>

      {role === 'librarian' && (
        <Link href="/users/librarian/addBook">
          <button className="btn btn-primary mb-6">➕ Add Book</button>
        </Link>
      )}

      <div className="overflow-x-auto">
          <table className="table table border border-white">
            <thead className="bg-neutral-focus text-white">
            <tr className="bg-neutral-focus text-white">
              <th className="p-3">ID</th>
              <th className="p-3">Title</th>
              <th className="p-3">Author</th>
              <th className="p-3">ISBN</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Year</th>
              <th className="p-3">Genre</th>
              <th className="p-3">Shelf</th>
              {role === 'librarian' && <th className="p-3">Actions</th>}
              {role === 'student' && <th className="p-3">Borrow</th>}
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id} className="hover">
                <td className="p-3">{book.id}</td>
                <td className="p-3">{book.title}</td>
                <td className="p-3">{book.author_name}</td>
                <td className="p-3">{book.isbn}</td>
                <td className="p-3">{book.quantity}</td>
                <td className="p-3">{book.year}</td>
                <td className="p-3">{book.genre}</td>
                <td className="p-3">{book.shelf_location}</td>

                {role === 'librarian' && (
                  <td className="p-3 flex flex-wrap gap-2">
                    <Link href={`/users/librarian/updateBook?id=${book.id}`}>
                      <button className="btn btn-sm btn-accent">✏️ Update</button>
                    </Link>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => handleDelete(book.id)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                )}

                {role === 'student' && (
                  <td className="p-3">
                    {book.quantity > 0 ? (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleBorrowRequest(book.id)}
                      >
                        Request Borrow
                      </button>
                    ) : (
                      <span className="text-red-500 font-semibold">Out of stock</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default BookListPage;
