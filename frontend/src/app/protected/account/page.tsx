"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { XMarkIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

interface JwtPayload {
  id: number;
  email: string;
  role: string;
  fullName?: string;
}

export default function UpdateUserModal() {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode<JwtPayload>(token);
      setFullName(decoded.fullName || "");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        "http://localhost:3000/users/me",
        {
            fullName,
            password: password || undefined,
        },
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );

        if (res.data.access_token) {
        localStorage.setItem("token", res.data.access_token);
        }

        toast.success("User information updated!");
        router.push("/protected/dashboard");

    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur">
      {/* Modal Box */}
      <div className="relative bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md text-white">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h1 className="text-2xl font-bold mb-6 text-center">Update User Info</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full name */}
          <div>
            <label className="block mb-1 font-semibold">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-semibold">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Leave blank to keep current password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-success w-full normal-case mt-4"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
