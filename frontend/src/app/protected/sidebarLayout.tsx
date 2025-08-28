"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  role: string;
}

export default function Sidebar() {
  const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setRole(decoded.role);
      } catch {
        setRole(null);
      }
    }
  }, []);

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const navLink = (href: string, label: string, icon?: string) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer select-none
          ${active ? "bg-[#047857]/30 text-white" : "text-white hover:bg-[#047857]/20"}
          relative
        `}
      >
        {active && (
          <span
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md"
            style={{ backgroundColor: "#4C51BF" }}
          />
        )}
        <span>{icon}</span>
        <span className="font-semibold">{label}</span>
      </Link>
    );
  };

  return (
    <aside
      className="fixed top-[53px] left-0 w-72 h-[calc(100vh-53px)] p-6 flex flex-col"
      style={{ backgroundColor: "#064E3B" }}
    >
    

      <nav className="flex flex-col gap-2 flex-1">
        {navLink("/protected/dashboard", "Dashboard", "🏠")}

        {role === "librarian" && (
          <>
            {navLink("/protected/users/librarian/bookManagement", "Book Management", "📘")}
            {navLink("/protected/users/librarian/studentManagement", "Student Management", "👥")}
            {navLink("/protected/users/librarian/borrowRequest", "Borrow Requests", "📥")}
            {navLink("/protected/users/librarian/manageTransaction", "Manage Transactions", "🔧")}
          </>
        )}

        {(role === "admin" || role === "student") && (
          <>
            {navLink("/protected/books", "View Books", "📖")}
          </>
        )}
      </nav>

    </aside>
  );
}
