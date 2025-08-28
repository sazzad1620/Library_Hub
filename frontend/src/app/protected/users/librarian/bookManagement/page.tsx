'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
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

export default function BookManagement() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [form, setForm] = useState<Partial<Book>>({
    title: '',
    author_name: '',
    isbn: '',
    quantity: 0,
    year: 0,
    genre: '',
    shelf_location: '',
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // ✅ Fetch books
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchBooks = async () => {
      try {
        const res = await axios.get('http://localhost:3000/booklist', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooks(res.data);
      } catch (err) {
        console.error(err);
        router.push('/login');
      }
    };

    fetchBooks();
  }, [router]);

  // ✅ Form input handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === 'quantity' || name === 'year' ? Number(value) : value,
    });
  };

  // ✅ Select book to update
  const handleEdit = (book: Book) => {
    setSelectedId(book.id);
    setForm(book);
  };

  // ✅ Cancel update
  const handleCancel = () => {
    setSelectedId(null);
    setForm({
      title: '',
      author_name: '',
      isbn: '',
      quantity: 0,
      year: 0,
      genre: '',
      shelf_location: '',
    });
  };

  // ✅ Add book
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/booklist', form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success("Book added");
      handleCancel();
      refreshBooks();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add');
    }
  };

  // ✅ Update book
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, ...data } = form;
      await axios.patch(`http://localhost:3000/booklist/${selectedId}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success("Book updated");
      handleCancel();
      refreshBooks();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update");
    }
  };

  // ✅ Delete book
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this book?')) return;
    try {
      await axios.delete(`http://localhost:3000/booklist/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success("Book deleted");
      refreshBooks();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    }
  };

  // ✅ Reload book list
  const refreshBooks = async () => {
    const res = await axios.get('http://localhost:3000/booklist', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setBooks(res.data);
  };

  return (
    <div className="p-8">
     

      <div className="bg-gray-800/80 p-8 rounded-lg shadow-lg text-white mb-8">
       <h2 className="text-2xl font-bold mb-4 text-white">Book Management</h2>
          <table className="table table border border-white">
            <thead className="bg-neutral-focus text-white">
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>ISBN</th>
              <th>Quantity</th>
              <th>Year</th>
              <th>Genre</th>
              <th>Shelf</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-4">
                  No books found.
                </td>
              </tr>
            ) : (
              books.map(book => (
                <tr key={book.id}>
                  <td>{book.id}</td>
                  <td>{book.title}</td>
                  <td>{book.author_name}</td>
                  <td>{book.isbn}</td>
                  <td>{book.quantity}</td>
                  <td>{book.year}</td>
                  <td>{book.genre}</td>
                  <td>{book.shelf_location}</td>
                  <td className="flex gap-2">
                    <button
                      onClick={() => handleEdit(book)}
                      className="btn btn-sm btn-primary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="btn btn-sm btn-error"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="bg-gray-800/80 p-8 rounded-lg shadow-lg text-white">
       {/* ✅ Add / Update form */}
      <h3
        className="text-2xl font-bold mb-8 text-white"
        
      >
        {selectedId ? "Update Book" : "Add New Book"}
      </h3>
      <form onSubmit={selectedId ? handleUpdate : handleAdd}>
        {[
          "title",
          "author_name",
          "isbn",
          "quantity",
          "year",
          "genre",
          "shelf_location",
        ].map((key) => (
          <div
            key={key}
            style={{
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <label
              htmlFor={key}
              style={{
                width: "150px", // label fixed width
                fontWeight: "bold",
                color: "white",
                textTransform: "capitalize",
              }}
            >
              {key.replace("_", " ")}
            </label>
            <input
              id={key}
              name={key}
              value={
                key === "quantity" || key === "year"
                  ? ((form as any)[key] === 0 || (form as any)[key] == null
                      ? ""
                      : (form as any)[key])
                  : (form as any)[key] ?? ""
              }
              onChange={handleChange}
              required
              type={key === "quantity" || key === "year" ? "number" : "text"}
              style={{
                flex: "1",
                padding: "8px 10px",
                borderRadius: "4px",
                border: "1px solid #4B5563",
                color: "white",
              }}
            />
          </div>
        ))}
        <button type="submit" style={button}>
          {selectedId ? "Update" : "Add"} Book
        </button>
        {selectedId && (
          <button
            type="button"
            onClick={handleCancel}
            style={{
              ...button,
              marginLeft: "10px",
              backgroundColor: "gray",
            }}
          >
            Cancel
          </button>
        )}
      </form>
      </div>

          </div>
        );
      }

const button: React.CSSProperties = {
  marginTop: "10px",
  padding: "8px 15px",
  borderRadius: "5px",
  backgroundColor: "#0070f3",
  color: "white",
  border: "none",
  cursor: "pointer",
};