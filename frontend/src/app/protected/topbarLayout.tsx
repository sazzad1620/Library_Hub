"use client";

import { useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { ChevronDown, User as UserIcon } from "lucide-react";
import { BookOpenIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

interface JwtPayload {
  id: number;
  email: string;
  role: string;
  fullName?: string;
}

export default function TopBar() {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode<JwtPayload>(token);
      setUser(decoded);
    }
  }, []);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleUpdateUser = () => {
    router.push("/protected/account");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-15 py-3 bg-neutral-900 text-white">
      {/* Left side (logo) */}
      <div className="flex items-center gap-2">
        <BookOpenIcon className="w-6 h-6" />
        <span className="font-bold text-xl">LibraryHub</span>
      </div>

      {/* Right side (user) */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2"
        >
          <UserIcon className="w-7 h-7" />
          <span>{user?.fullName || "User"}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown panel */}
        {open && (
          <div className="absolute right-0 mt-2 w-64 bg-neutral-800 text-white rounded-lg shadow-lg p-4">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                style={{ backgroundColor: "#047857" }}
              >
                {user?.fullName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="mt-2 text-lg font-bold text-white">
                {user?.fullName || "User"}
              </div>
              <div className="text-gray-400 text-sm">
                {user?.email || ""}
              </div>
            </div>

            {/* DaisyUI buttons */}
            <button
              onClick={handleUpdateUser}
              className="btn btn-sm btn-info w-full mb-3 normal-case"
            >
              Update User Info
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-sm btn-error w-full normal-case"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
