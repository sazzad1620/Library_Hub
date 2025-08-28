'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import toast from "react-hot-toast";

interface Transaction {
  id: number;
  status: string;
  user: {
    id: number;
    fullName: string;
    email: string;
  };
  book: {
    id: number;
    title: string;
  };
}

interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

const BorrowRequestPage = () => {
  const [role, setRole] = useState<string>('');
  const [requests, setRequests] = useState<Transaction[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      setRole(decoded.role);

      if (decoded.role !== 'librarian') {
        toast.error('Access denied. Only librarians can view this page.');
        router.push('/');
      } else {
        fetchRequests(token);
      }
    } catch (err) {
      console.error('Invalid token', err);
      toast.error('Session expired');
      router.push('/login');
    }
  }, []);

  const fetchRequests = async (token: string) => {
    try {
      const res = await axios.get(
        'http://localhost:3000/transactions/requests',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRequests(res.data);
    } catch (err: any) {
      console.error('Error fetching requests:', err);
      toast.error(err?.response?.data?.message || 'Failed to fetch requests');
    }
  };

  const handleApprove = async (transactionId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:3000/transactions/approve/${transactionId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success('Request approved and book borrowed.');
      setRequests((prev) =>
        prev.filter((req) => req.id !== transactionId)
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Failed to approve request';
      toast.error(message);
    }
  };

  const handleReject = async (transactionId: number) => {
    const confirmReject = confirm(
      'Are you sure you want to reject this borrow request?'
    );
    if (!confirmReject) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:3000/transactions/reject/${transactionId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success('Request rejected.');
      setRequests((prev) =>
        prev.filter((req) => req.id !== transactionId)
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Failed to reject request';
      toast.error(message);
    }
  };

  if (!role) return <p>Loading...</p>;

  return (
    <div className="p-8">
      
      {requests.length === 0 ? (
        <p className="text-white">No pending borrow requests.</p>
      ) : (
        <div className="bg-gray-800/80 p-8 rounded-lg shadow-lg text-white mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Borrow Requests</h2>

          <table className="table table border border-white">
            <thead className="bg-neutral-focus text-white">
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Book</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>{req.id}</td>
                  <td>
                    {req.user?.fullName || 'N/A'}<br />
                    <span className="text-sm text-gray-400">
                      {req.user?.email}
                    </span>
                  </td>
                  <td>{req.book?.title || 'N/A'}</td>
                  <td>{req.status}</td>
                  <td className="flex gap-2">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="btn btn-xs btn-success"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="btn btn-xs btn-error"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BorrowRequestPage;
