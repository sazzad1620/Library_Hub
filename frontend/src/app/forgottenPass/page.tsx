'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from "react-hot-toast";

const ForgotPasswordPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRequestOtp = async () => {
    try {
      await axios.post('http://localhost:3000/password-reset/request-otp', { email });
      toast.success('OTP has been sent to your email.');
      setStep('verify');
    } catch (err: any) {
      console.error(err);
      const message = Array.isArray(err?.response?.data?.message)
        ? err.response.data.message.join('\n')
        : err?.response?.data?.message || 'Failed to send OTP.';
      toast.error(message);
    }
  };

  const handleVerifyOtp = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await axios.post('http://localhost:3000/password-reset/verify-otp', {
        email,
        otp,
        newPassword,
      });
      toast.success("Password has been reset successfully!");
      router.push('/login');
    } catch (err: any) {
      console.error(err);
      const message = Array.isArray(err?.response?.data?.message)
        ? err.response.data.message.join('\n')
        : err?.response?.data?.message || 'Failed to verify OTP.';
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
      {/* ✅ Add Toaster here */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-gray-800 p-10 rounded-lg shadow-lg w-full max-w-md text-white">
        <h1 className="text-3xl font-bold mb-6 text-center">Forgotten Password</h1>

        {step === 'email' && (
          <div className="space-y-5">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
              style={customInputStyle}
              required
            />
            <button
              onClick={handleRequestOtp}
              className="btn btn-primary w-full"
            >
              Send OTP
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-5">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className={inputClasses}
              style={customInputStyle}
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClasses}
              style={customInputStyle}
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClasses}
              style={customInputStyle}
              required
            />
            <button
              onClick={handleVerifyOtp}
              className="btn btn-success w-full"
            >
              Reset Password
            </button>
          </div>
        )}

        <p className="text-sm text-gray-400 mt-4 text-center">
          <Link href="/login" className="text-blue-400 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
};

export default ForgotPasswordPage;
