import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import toast from "react-hot-toast";

const Billing = () => {
  const [medicine, setMedicine] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("flat");
  const [invoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [invoiceDate] = useState(new Date().toLocaleDateString());
  const [loading, setLoading] = useState(false);

  const [customers, setCustomers] = useState([
    { id: 1, name: "Ravi Kumar", phone: "9876543210" },
    { id: 2, name: "Sneha Sharma", phone: "9123456780" },
  ]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const selectedCustomer = customers.find(
    (c) => c.id === parseInt(selectedCustomerId)
  );

  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
  const [custError, setCustError] = useState("");

  const printRef = useRef();

  // Handle Print
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: invoiceNumber,
    onAfterPrint: () => toast.success("Invoice printed successfully"),
    onPrintError: () => toast.error("Failed to print invoice"),
  });

  const addItem = () => {
    if (!medicine || !quantity || !price) {
      toast.error("Please fill all medicine details");
      return;
    }
    if (parseInt(quantity) <= 0 || parseFloat(price) <= 0) {
      toast.error("Quantity and price must be greater than 0");
      return;
    }
    const newItem = {
      id: Date.now(),
      name: medicine,
      quantity: parseInt(quantity),
      price: parseFloat(price),
    };
    setItems([...items, newItem]);
    setMedicine("");
    setQuantity("");
    setPrice("");
    toast.success("Medicine added successfully");
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
    toast.success("Medicine removed successfully");
  };

  const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const discountAmount =
    discountType === "percent" ? (discount / 100) * total : discount;
  const grandTotal = Math.max(total - discountAmount, 0);

  const handleAddCustomer = () => {
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      setCustError("Name and phone are required");
      return;
    }
    if (!/^[0-9]{10}$/.test(newCustomer.phone)) {
      setCustError("Please enter a valid 10-digit phone number");
      return;
    }
    const newEntry = {
      id: Date.now(),
      name: newCustomer.name,
      phone: newCustomer.phone,
    };
    setCustomers([...customers, newEntry]);
    setSelectedCustomerId(newEntry.id.toString());
    setNewCustomer({ name: "", phone: "" });
    setCustError("");
    setShowAddCustomerModal(false);
    toast.success("Customer added successfully");
  };

  const handleSaveInvoice = async () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one medicine");
      return;
    }

    try {
      setLoading(true);
      const invoiceData = {
        customer: {
          name: selectedCustomer.name,
          phone: selectedCustomer.phone,
        },
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: grandTotal,
        discount: discountAmount,
        discountType,
      };

      await axios.post("http://localhost:5000/api/invoices", invoiceData);
      toast.success("Invoice saved successfully");
      
      // Reset form
      setItems([]);
      setDiscount(0);
      setDiscountType("flat");
      setSelectedCustomerId("");
    } catch (err) {
      console.error("Error saving invoice:", err);
      toast.error(err.response?.data?.message || "Failed to save invoice");
    } finally {
      setLoading(false);
    }
  };

  // PDF Download Handler
  const handleDownloadPDF = () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer first");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one medicine");
      return;
    }

    try {
      const doc = new jsPDF();

      doc.text(`Invoice #: ${invoiceNumber}`, 10, 10);
      doc.text(`Date: ${invoiceDate}`, 10, 20);
      doc.text(`Customer: ${selectedCustomer.name}`, 10, 30);
      doc.text(`Phone: ${selectedCustomer.phone}`, 10, 40);

      autoTable(doc, {
        head: [["#", "Medicine", "Quantity", "Price (₹)", "Total (₹)"]],
        body: items.map((item, index) => [
          index + 1,
          item.name,
          item.quantity,
          `₹${item.price.toFixed(2)}`,
          `₹${(item.quantity * item.price).toFixed(2)}`,
        ]),
        startY: 50,
      });

      doc.text(`Subtotal: ₹${total.toFixed(2)}`, 10, doc.lastAutoTable.finalY + 10);
      doc.text(`Discount: ₹${discountAmount.toFixed(2)}`, 10, doc.lastAutoTable.finalY + 20);
      doc.text(`Grand Total: ₹${grandTotal.toFixed(2)}`, 10, doc.lastAutoTable.finalY + 30);

      doc.save(`${invoiceNumber}.pdf`);
      toast.success("PDF downloaded successfully");
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="ml-64 p-6 mt-16">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Billing</h2>

      {/* Select Customer */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-1">Select Customer:</label>
        <select
          value={selectedCustomerId}
          onChange={(e) => {
            if (e.target.value === "new") {
              setShowAddCustomerModal(true);
            } else {
              setSelectedCustomerId(e.target.value);
            }
          }}
          className="p-2 border rounded w-full md:w-1/3"
        >
          <option value="">-- Choose --</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.phone})
            </option>
          ))}
          <option value="new">+ Add New Customer</option>
        </select>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow">
            <h3 className="text-xl font-semibold mb-4">Add New Customer</h3>
            <input
              type="text"
              placeholder="Customer Name"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              className="w-full mb-3 p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              className="w-full mb-3 p-2 border rounded"
            />
            {custError && <p className="text-red-500 text-sm mb-2">{custError}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddCustomerModal(false);
                  setCustError("");
                }}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomer}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Medicine Name"
          value={medicine}
          onChange={(e) => setMedicine(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
          className="p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Price (₹)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min="0"
          step="0.01"
          className="p-2 border rounded"
        />
        <button
          onClick={addItem}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Medicine
        </button>
      </div>

      {/* Items List */}
      {items.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Added Medicines</h3>
          <div className="bg-white shadow rounded-xl overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm uppercase text-left">
                  <th className="px-4 py-2">Medicine</th>
                  <th className="px-4 py-2">Quantity</th>
                  <th className="px-4 py-2">Price</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">{item.quantity}</td>
                    <td className="px-4 py-2">₹{item.price.toFixed(2)}</td>
                    <td className="px-4 py-2">₹{(item.quantity * item.price).toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Discount Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Discount</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="flat">Flat Amount</option>
            <option value="percent">Percentage</option>
          </select>
          <input
            type="number"
            placeholder={discountType === "percent" ? "Discount %" : "Discount Amount"}
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            min="0"
            step={discountType === "percent" ? "1" : "0.01"}
            className="p-2 border rounded"
          />
          <div className="text-right">
            <span className="font-semibold">Discount Amount: </span>
            <span className="text-red-600">₹{discountAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Total Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Subtotal:</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Discount:</span>
          <span className="text-red-600">-₹{discountAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Grand Total:</span>
          <span className="text-green-600">₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSaveInvoice}
          disabled={loading || !selectedCustomer || items.length === 0}
          className={`px-6 py-2 rounded ${
            loading || !selectedCustomer || items.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          } text-white`}
        >
          {loading ? "Saving..." : "Save Invoice"}
        </button>
        <button
          onClick={handlePrint}
          disabled={!selectedCustomer || items.length === 0}
          className={`px-6 py-2 rounded ${
            !selectedCustomer || items.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
        >
          Print Invoice
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={!selectedCustomer || items.length === 0}
          className={`px-6 py-2 rounded ${
            !selectedCustomer || items.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          } text-white`}
        >
          Download PDF
        </button>
      </div>

      {/* Print Preview */}
      <div className="hidden">
        <div ref={printRef} className="p-6">
          <h2 className="text-2xl font-bold mb-4">Invoice</h2>
          <div className="mb-4">
            <p>Invoice #: {invoiceNumber}</p>
            <p>Date: {invoiceDate}</p>
            {selectedCustomer && (
              <>
                <p>Customer: {selectedCustomer.name}</p>
                <p>Phone: {selectedCustomer.phone}</p>
              </>
            )}
          </div>
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Medicine</th>
                <th className="px-4 py-2 text-left">Quantity</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">₹{item.price.toFixed(2)}</td>
                  <td className="px-4 py-2">₹{(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 text-right">
            <p className="font-semibold">Subtotal: ₹{total.toFixed(2)}</p>
            <p className="text-red-600">Discount: ₹{discountAmount.toFixed(2)}</p>
            <p className="text-lg font-bold text-green-600">
              Grand Total: ₹{grandTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;