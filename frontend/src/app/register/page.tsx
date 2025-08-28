'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import toast from "react-hot-toast";

const RegisterPage = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'librarian',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      ('Passwords do not match!');
      return;
    }

    try {
      await axios.post('http://localhost:3000/users/register', {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      toast.success("Registered successfully!");
    } catch (err: any) {
      console.error(err);
      const message = Array.isArray(err?.response?.data?.message)
        ? err.response.data.message.join('\n')
        : err?.response?.data?.message || 'Registration failed.';
      toast.error(message);
    }
  };

  const inputClasses =
    "w-full input input-bordered text-white placeholder-gray-300";

  const selectClasses =
    "w-full select select-bordered text-white";

  const customInputStyle = {
    backgroundColor: '#2B3443'
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-1000">
      <div className="bg-gray-800 p-10 rounded-lg shadow-lg w-full max-w-md text-white">
        <h1 className="text-3xl font-bold mb-6 text-center">Register</h1>
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className={inputClasses}
              style={customInputStyle}
              required
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClasses}
              style={customInputStyle}
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={inputClasses}
              style={customInputStyle}
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className={inputClasses}
              style={customInputStyle}
              required
            />
          </div>
          <div>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className={selectClasses}
              style={customInputStyle}
            >
              <option value="librarian">Librarian</option>
              <option value="student">Student</option>
            </select>
          </div>
          <button
            type="submit"
            className="btn btn-success w-full"
          >
            Register
          </button>
        </form>
        <p className="text-sm text-gray-400 mt-4 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </main>
  );
};

export default RegisterPage;
