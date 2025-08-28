'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import toast from "react-hot-toast";

const LoginPage = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:3000/users/login', form);
      const token = res.data.access_token;

      localStorage.setItem('token', token);
      const decoded: any = jwtDecode(token);
      console.log('Logged in user token payload:', decoded);

      toast.success("Login successful!");
      router.push('/protected/dashboard');
    } catch (err: any) {
      console.error('AXIOS ERROR:', err);
      console.log('STATUS:', err?.response?.status);
      console.log('RESPONSE DATA:', err?.response?.data);

      const message = Array.isArray(err?.response?.data?.message)
        ? err.response.data.message.join('\n')
        : err?.response?.data?.message || 'Login failed.';

      toast.error(message);
    }
  };

  const inputClasses =
    "w-full input input-bordered text-white placeholder-gray-300";

  const customInputStyle = {
    backgroundColor: '#2B3443'
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-1000">
      <div className="bg-gray-800 p-10 rounded-lg shadow-lg w-full max-w-md text-white">
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleLogin} className="space-y-5">
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
          <button
            type="submit"
            className="btn btn-primary w-full"
          >
            Login
          </button>
        </form>
        <p className="text-sm text-gray-400 mt-4 text-center">
          <Link href="/forgottenPass" className="text-blue-400 hover:underline">
            Forgotten password?
          </Link>
        </p>
        <p className="text-sm text-gray-400 mt-4 text-center">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-400 hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
