import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const Inventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  const [newMedicine, setNewMedicine] = useState({
    name: "",
    quantity: "",
    expiry: "",
    price: "",
  });

  const fetchMedicines = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/medicines");
      setMedicines(res.data);
      setFiltered(res.data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load medicines.");
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      setFiltered(medicines);
      return;
    }

    const filteredData = medicines.filter((med) =>
      med.name.toLowerCase().includes(value.toLowerCase())
    );
    setFiltered(filteredData);
  };

  const deleteMedicine = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/medicines/${id}`);
      const updated = medicines.filter((med) => med._id !== id);
      setMedicines(updated);
      setFiltered(updated);
      toast.success("Medicine deleted.");
    } catch (err) {
      toast.error("Delete failed.");
    }
  };

  const handleAddMedicine = async () => {
    const { name, quantity, price, expiry } = newMedicine;
    if (!name || !quantity || !price || !expiry) {
      toast.error("All fields are required.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/medicines", newMedicine);
      const updated = [...medicines, res.data];
      setMedicines(updated);
      setFiltered(updated);
      toast.success("Medicine added.");
      setNewMedicine({ name: "", quantity: "", expiry: "", price: "" });
      setShowAddModal(false);
    } catch (err) {
      toast.error("Failed to add medicine.");
    }
  };

  const handleUpdateMedicine = async () => {
    const { name, quantity, price, expiry } = editingMedicine;
    if (!name || !quantity || !price || !expiry) {
      toast.error("All fields are required.");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/medicines/${editingMedicine._id}`,
        editingMedicine
      );
      const updated = medicines.map((med) =>
        med._id === res.data._id ? res.data : med
      );
      setMedicines(updated);
      setFiltered(updated);
      toast.success("Medicine updated.");
      setEditingMedicine(null);
      setShowEditModal(false);
    } catch (err) {
      toast.error("Update failed.");
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  return (
    <div className="ml-64 p-6 mt-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Inventory</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Medicine
        </button>
      </div>

      {/* 🔍 Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search medicine..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full md:w-1/3 p-2 border rounded"
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-blue-100 text-left text-sm uppercase text-gray-600">
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Quantity</th>
                <th className="py-3 px-6">Expiry Date</th>
                <th className="py-3 px-6">Price (₹)</th>
                <th className="py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No medicines found.
                  </td>
                </tr>
              ) : (
                filtered.map((med) => (
                  <tr key={med._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-6">{med.name}</td>
                    <td className="py-3 px-6">{med.quantity}</td>
                    <td className="py-3 px-6">
                      {new Date(med.expiry).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-6">₹{med.price.toFixed(2)}</td>
                    <td className="py-3 px-6 space-x-2">
                      <button
                        onClick={() => {
                          setEditingMedicine(med);
                          setShowEditModal(true);
                        }}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMedicine(med._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Medicine</h3>
            <input
              type="text"
              placeholder="Medicine Name"
              value={newMedicine.name}
              onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
              className="w-full mb-3 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newMedicine.quantity}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, quantity: e.target.value })
              }
              className="w-full mb-3 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Price (₹)"
              value={newMedicine.price}
              onChange={(e) => setNewMedicine({ ...newMedicine, price: e.target.value })}
              className="w-full mb-3 p-2 border rounded"
            />
            <input
              type="date"
              value={newMedicine.expiry}
              onChange={(e) => setNewMedicine({ ...newMedicine, expiry: e.target.value })}
              className="w-full mb-3 p-2 border rounded"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMedicine}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Medicine Modal */}
      {showEditModal && editingMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Medicine</h3>
            <input
              type="text"
              value={editingMedicine.name}
              onChange={(e) =>
                setEditingMedicine({ ...editingMedicine, name: e.target.value })
              }
              className="w-full mb-3 p-2 border rounded"
            />
            <input
              type="number"
              value={editingMedicine.quantity}
              onChange={(e) =>
                setEditingMedicine({ ...editingMedicine, quantity: e.target.value })
              }
              className="w-full mb-3 p-2 border rounded"
            />
            <input
              type="number"
              value={editingMedicine.price}
              onChange={(e) =>
                setEditingMedicine({ ...editingMedicine, price: e.target.value })
              }
              className="w-full mb-3 p-2 border rounded"
            />
            <input
              type="date"
              value={editingMedicine.expiry?.slice(0, 10)}
              onChange={(e) =>
                setEditingMedicine({ ...editingMedicine, expiry: e.target.value })
              }
              className="w-full mb-3 p-2 border rounded"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateMedicine}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
