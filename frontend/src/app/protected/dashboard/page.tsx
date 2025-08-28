'use client';

import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from "react-hot-toast";
import axios from 'axios';
import {
  BookOpenIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";


interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

interface PendingLibrarian {
  id: number;
  fullName: string;
  email: string;
}

interface Transaction {
  id: number;
  user: {
    id: number;
    fullName: string;
    email: string;
  };
  book: {
    id: number;
    title: string;
    author_name: string;
  };
  transactionDate: string;
  status: string;
}

interface LibrarianSummary {
  totalBooks: number;
  totalStudents: number;
  borrowedCount: number;
  returnedCount: number;
  overdueCount: number;
}

interface TopBook {
  id: number;
  title: string;
  borrowCount: number;
}

const Dashboard = () => {
  const [role, setRole] = useState<string>('');
  const [pendingLibrarians, setPendingLibrarians] = useState<PendingLibrarian[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [librarianSummary, setLibrarianSummary] = useState<LibrarianSummary | null>(null);
  const [tasks, setTasks] = useState<string[]>([]);
  const [newTask, setNewTask] = useState<string>("");

  const router = useRouter();

  const [books, setBooks] = useState<TopBook[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;



  useEffect(() => {
  const token = localStorage.getItem('token');

  if (!token) {
    toast.error("Not logged in!");
    router.push('/login');
    return;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    setRole(decoded.role);

    if (decoded.role === 'admin') {
      fetchPendingLibrarians(token);
    }

    if (decoded.role === 'librarian') {
      // initial fetch for page 1
      fetchTransactions(token, 1);
      fetchLibrarianSummary(token);
      fetchTopBooks(token);
      loadTasksFromStorage();
      setCurrentPage(1); // ensure currentPage state is 1 initially
    }
  } catch (err) {
    console.error('Invalid token:', err);
    toast.error("Session expired or token invalid");
    router.push('/login');
  }
}, []);

// Separate useEffect to refetch transactions when currentPage changes
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token && role === 'librarian') {
    fetchTransactions(token, currentPage);
  }
}, [currentPage, role]);


  const fetchPendingLibrarians = async (token: string) => {
    try {
      const res = await axios.get('http://localhost:3000/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pending = res.data.filter((user: any) => user.role === 'pending-librarian');
      setPendingLibrarians(pending);
    } catch (err: any) {
      const message = Array.isArray(err?.response?.data?.message)
        ? err.response.data.message.join('\n')
        : err?.response?.data?.message || 'Action failed';
      toast.error(message);
    }
  };

  const fetchTransactions = async (token: string, page = 1) => {
  try {
    const res = await axios.get(`http://localhost:3000/transactions/all?page=${page}&limit=${ITEMS_PER_PAGE}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setTransactions(res.data.transactions); // Assuming backend sends { transactions: [], totalPages: number }
    setTotalPages(res.data.totalPages);
  } catch (err: any) {
    console.error('Failed to fetch transactions:', err);
    toast.error("Failed to fetch transactions");
  }
};


  const fetchLibrarianSummary = async (token: string) => {
    try {
      const res = await axios.get('http://localhost:3000/transactions/librarian-summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLibrarianSummary(res.data);
    } catch (err: any) {
      console.error('Failed to fetch librarian summary:', err);
      toast.error("Failed to fetch librarian summary");
    }
  };

  const handleApprove = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`http://localhost:3000/users/approve-librarian/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingLibrarians((prev) => prev.filter((u) => u.id !== id));
      toast.success("Librarian approved successfully");
    } catch (err: any) {
      const message = Array.isArray(err?.response?.data?.message)
        ? err.response.data.message.join('\n')
        : err?.response?.data?.message || 'Action failed';
      toast.error(message);
    }
  };

  const handleReject = async (id: number) => {
    const confirmReject = confirm('Are you sure you want to reject this librarian?');
    if (!confirmReject) return;

    try {
      await axios.patch(`http://localhost:3000/users/reject-librarian/${id}`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.error("Librarian rejected");
      setPendingLibrarians(prev => prev.filter(user => user.id !== id));
    } catch (err: any) {
      const message = Array.isArray(err?.response?.data?.message)
        ? err.response.data.message.join('\n')
        : err?.response?.data?.message || 'Action failed';
      toast.error(message);
    }
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      const updated = [...tasks, newTask.trim()];
      setTasks(updated);
      localStorage.setItem("librarianTasks", JSON.stringify(updated));
            setNewTask("");
      }
  };

  const handleRemoveTask = (index: number) => {
    const updated = tasks.filter((_, i) => i !== index);
    setTasks(updated);
    localStorage.setItem("librarianTasks", JSON.stringify(updated));

   };

  const fetchTopBooks = async (token: string) => {
    try {
      const res = await axios.get(
        "http://localhost:3000/transactions/top-books",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const mapped = res.data.map((b: any) => ({
        id: b.id,
        title: b.title,
        borrowCount: b.borrow_count,
      }));
      setBooks(mapped);
    } catch (error) {
      console.error("Failed to fetch top books:", error);
      setBooks([]); // fallback to empty
    }
  };

  const loadTasksFromStorage = () => {
    const saved = localStorage.getItem("librarianTasks");
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch {
        console.error("Failed to parse saved tasks");
      }
    }
  };



  if (!role) return <p>Loading dashboard...</p>;

  return (
    <div className="p-8 space-y-8">
      {role === 'librarian' && (
        <h2 className="text-3xl font-bold text-white">Librarian Dashboard</h2>
      )}

      {/* Admin pending librarians */}
      {role === 'admin' && (
        <>
          <h3 className="text-3xl font-bold text-white mb-4">Admin Dashboard</h3>
          <div className="bg-gray-800/80 p-8 rounded-lg shadow-lg text-white">
            <h4 className="text-2xl font-semibold text-white mb-6">Pending Librarians</h4>
            {pendingLibrarians.length === 0 ? (
              <p className="text-white">No pending librarians</p>
            ) : (
              <table className="table w-full border border-white mt-2 text-white">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLibrarians.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="btn btn-xs btn-success mr-2"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          className="btn btn-xs btn-error"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Librarian summary 5 boxes (separate box per note) */}
      {role === 'librarian' && librarianSummary && (
        <div className="grid grid-cols-5 gap-6">
          {/* Total Books */}
          <div className="bg-gray-800/80 p-6 rounded-lg shadow-lg text-white flex items-center">
            <BookOpenIcon className="w-10 h-10 text-green-400 flex-shrink-0" />
            <div className="ml-4 flex flex-col">
              <span className="text-gray-400 text-xs">Total Books</span>
              <span className="text-3xl mt-1">{librarianSummary.totalBooks}</span>
            </div>
          </div>

          {/* Total Students */}
          <div className="bg-gray-800/80 p-6 rounded-lg shadow-lg text-white flex items-center">
            <UsersIcon className="w-10 h-10 text-blue-400 flex-shrink-0" />
            <div className="ml-4 flex flex-col">
              <span className="text-gray-400 text-xs">Total Students</span>
              <span className="text-3xl mt-1">{librarianSummary.totalStudents}</span>
            </div>
          </div>

          {/* Books Borrowed */}
          <div className="bg-gray-800/80 p-6 rounded-lg shadow-lg text-white flex items-center">
            <ClipboardDocumentListIcon className="w-10 h-10 text-yellow-400 flex-shrink-0" />
            <div className="ml-4 flex flex-col">
              <span className="text-gray-400 text-xs">Books Borrowed</span>
              <span className="text-3xl mt-1">{librarianSummary.borrowedCount}</span>
            </div>
          </div>

          {/* Returns Processed */}
          <div className="bg-gray-800/80 p-6 rounded-lg shadow-lg text-white flex items-center">
            <ArrowPathIcon className="w-10 h-10 text-indigo-400 flex-shrink-0" />
            <div className="ml-4 flex flex-col">
              <span className="text-gray-400 text-xs">Returns Processed</span>
              <span className="text-3xl mt-1">{librarianSummary.returnedCount}</span>
            </div>
          </div>

          {/* Overdue Books */}
          <div className="bg-gray-800/80 p-6 rounded-lg shadow-lg text-white flex items-center">
            <ExclamationCircleIcon className="w-10 h-10 text-red-400 flex-shrink-0" />
            <div className="ml-4 flex flex-col">
              <span className="text-gray-400 text-xs">Overdue Books</span>
              <span className="text-3xl mt-1">{librarianSummary.overdueCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Librarian Transactions */}
      {role === 'librarian' && (
        <div className="bg-gray-800/80 p-8 rounded-lg shadow-lg text-white">
          <h3 className="text-2xl font-semibold mb-4">Book Transactions</h3>
          {!transactions || transactions.length === 0 ? (
            <p>No transactions found.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table w-full border border-white">
                  <thead className="bg-neutral-focus text-white">
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Book</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>{tx.id}</td>
                        <td>
                          <span className="font-bold">{tx.user?.fullName || 'N/A'}</span>
                          <br />
                          <span className="text-sm text-gray-400">{tx.user?.email || ''}</span>
                        </td>
                        <td>
                          {tx.book?.title || 'N/A'}{" "}
                          {tx.book?.author_name && (
                            <>
                              <br />
                              <span className="text-sm text-gray-400">
                                by {tx.book.author_name}
                              </span>
                            </>
                          )}
                        </td>
                        <td>{tx.transactionDate ? new Date(tx.transactionDate).toLocaleDateString() : 'N/A'}</td>
                        <td>{tx.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="btn-group mt-4 justify-center flex flex-wrap gap-2">
                {/* Previous */}
                <button
                  className="btn"
                  onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`btn ${page === currentPage ? 'btn-primary' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                {/* Next */}
                <button
                  className="btn"
                  onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
              </div>
            </>
          )}
        </div>
      )}


      {/* NEW: Librarian Book list + To-Do section */}
      {role === 'librarian' && (
        <div className="flex w-full gap-6 mt-8">
          {/* Books (left) */}
          <div className="w-2/3 grid grid-cols-3 gap-4">
            {Array.isArray(books) && books.length > 0 ? (
  books.map((book) => (
          <div
            key={book.id}
            className="bg-gray-800/80 p-8 rounded-lg shadow-lg text-white"
          >
            <BookOpenIcon className="h-50 w-30 text-green-500 mb-2" />
            <h3 className="text-white text-lg font-bold">{book.title}</h3>
            <p className="text-gray-400 text-xs mt-1">
              Borrowed {book.borrowCount} times
            </p>
          </div>
        ))
      ) : (
        <p className="text-gray-400">No top books found.</p>
      )}

          </div>

          {/* To-Do list (right) */}
          <div className="bg-gray-800/80 p-8 rounded-lg shadow-lg text-white">
            <h2 className="text-white text-xl font-bold mb-4">To-Do List</h2>
            <div className="flex mb-4">
              <input
                type="text"
                className="flex-grow px-3 py-2 rounded-l bg-gray-700 text-white focus:outline-none"
                placeholder="Add new task"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
              <button
                onClick={handleAddTask}
                className="bg-green-600 hover:bg-green-500 px-3 py-2 rounded-r text-white"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            <ul className="space-y-2">
              {tasks.map((task, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-700 px-3 py-2 rounded"
                >
                  <span className="text-white">{task}</span>
                  <button
                    onClick={() => handleRemoveTask(index)}
                    className="text-green-400 hover:text-green-200"
                  >
                    ✓
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {role === 'student' && (
        <>
          <h3 className="text-lg font-semibold mb-4">🎓 Student Panel</h3>
          <p>Use the sidebar to view the booklist.</p>
        </>
      )}
    </div>
  );
};

export default Dashboard;
