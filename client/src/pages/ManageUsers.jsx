import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to load users");
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${id}`, { role: newRole });
      toast.success("Role updated");
      fetchUsers();
    } catch (err) {
      toast.error("Role update failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`);
        toast.success("User deleted");
        fetchUsers();
      } catch (err) {
        toast.error("User deletion failed");
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="ml-64 p-6 mt-16">
      <h2 className="text-2xl font-bold mb-6">Manage Users</h2>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-blue-100 text-gray-700 text-sm uppercase text-left">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2 capitalize">{user.role}</td>
                <td className="px-4 py-2 flex gap-2">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="border p-1 rounded"
                  >
                    <option value="admin">Admin</option>
                    <option value="pharmacist">Pharmacist</option>
                  </select>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
