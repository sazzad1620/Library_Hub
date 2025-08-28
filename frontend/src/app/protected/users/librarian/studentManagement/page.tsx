"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
}

export default function StudentManagementPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchStudents = async () => {
    setLoading(true);
            try {
            const res = await axios.get("http://localhost:3000/users/students", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });

      // Filter only students
      const studentUsers = res.data.filter(
        (user: User) => user.role === "student"
      );
      setStudents(studentUsers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (id: number, currentStatus: boolean) => {
    try {
      await axios.patch(
        `http://localhost:3000/users/active/${id}`,
        { active: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="p-8">
    <div className="bg-gray-800/80 p-8 rounded-lg shadow-lg text-white mb-8">
      <h1 className="text-3xl font-bold mb-6">Student Management</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table border border-white">
            <thead className="bg-neutral-focus text-white">
              <tr
              >
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.fullName}</td>
                  <td>{student.email}</td>
                  <td>{student.active ? "Active" : "Blocked"}</td>
                  <td>
                    <button
                      className={`btn btn-sm ${
                        student.active ? "btn-error" : "btn-success"
                      }`}
                      onClick={() => toggleBlock(student.id, student.active)}
                    >
                      {student.active ? "Block" : "Unblock"}
                    </button>
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
}
