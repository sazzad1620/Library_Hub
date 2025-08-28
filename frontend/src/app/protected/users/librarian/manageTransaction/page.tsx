"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface JwtPayload {
  id: number;
  email: string;
  role: string;
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

const ManageTransactionPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const decoded = jwtDecode<JwtPayload>(token);
    if (decoded.role !== "librarian") {
      toast.error("Access denied!");
      router.push("/login");
      return;
    }

    fetchTransactions(token);
  }, []);

  const fetchTransactions = async (token: string) => {
    try {
      // Use /all to get all transactions for librarian/admin
      const res = await axios.get("http://localhost:3000/transactions/all", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
  params: {
    page: 1,
    limit: 99999,
  },
});
      setTransactions(res.data.transactions);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (id: number, newStatus: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.patch(
        `http://localhost:3000/transactions/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(res.data.message);
      fetchTransactions(token!);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to update transaction status";
      toast.success(message);
    }
  };

  if (loading) return <p>Loading transactions...</p>;

  return (
    <div className="p-8">
    <div className="bg-gray-800/80 p-8 rounded-lg shadow-lg text-white mb-8">
      <h2 className="text-2xl font-bold mb-6 text-white">Manage Transactions</h2>

      {transactions.length === 0 ? (
        <p className="text-white">No transactions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table border border-white">
            <thead className="bg-neutral-focus text-white">
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Book</th>
                <th>Date</th>
                <th>Status</th>
                <th>Change Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.id}</td>
                  <td>
                    <strong>{tx.user?.fullName || "N/A"}</strong>
                    <br />
                    <span className="text-gray-400 text-sm">
                      {tx.user?.email || "N/A"}
                    </span>
                  </td>
                  <td>
                    {tx.book?.title || "N/A"}
                    <br />
                    <span className="text-gray-400 text-sm">
                      {tx.book?.author_name || ""}
                    </span>
                  </td>
                  <td>{new Date(tx.transactionDate).toLocaleDateString()}</td>
                  <td>{tx.status}</td>
                  <td>
                    <select
                      className="select select-xs select-bordered"
                      value={tx.status}
                      onChange={(e) => handleChangeStatus(tx.id, e.target.value)}
                    >
                      <option value="Requested">Requested</option>
                      <option value="Borrowed">Borrowed</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Returned">Returned</option>
                      <option value="Overdue">Overdue</option> {/* Added Overdue */}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </div>
  );
};

export default ManageTransactionPage;
