import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Reports = () => {
  const [invoices, setInvoices] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    customer: "",
    medicine: "",
  });

  const fetchFilteredInvoices = useCallback(async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await axios.get(`http://localhost:5000/api/invoices?${query}`);
      setInvoices(res.data);
    } catch (err) {
      toast.error("Failed to fetch report data");
    }
  }, [filters]);

  const fetchMedicines = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/medicines");
      setMedicines(res.data);
    } catch (err) {
      toast.error("Failed to fetch medicine data");
    }
  };

  useEffect(() => {
    fetchFilteredInvoices();
    fetchMedicines();
  }, [fetchFilteredInvoices]);

  const totalSales = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const profit = totalSales * 0.3;
  const expiredStock = medicines.filter((m) => new Date(m.expiry) < new Date()).length;

  // Monthly Sales
  const monthlySales = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleString("default", { month: "short" }),
    total: 0,
  }));

  invoices.forEach((inv) => {
    const month = new Date(inv.date).getMonth();
    monthlySales[month].total += inv.totalAmount || 0;
  });

  // Stock Distribution by Category
  const categoryMap = {};
  medicines.forEach((m) => {
    const cat = m.category || "Others";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const stockDistData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Sales Report", 14, 10);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 16);
    const tableData = invoices.flatMap((inv) =>
      inv.items.map((item) => [
        inv.invoiceNumber,
        new Date(inv.date).toLocaleDateString(),
        inv.customer.name,
        item.name,
        item.quantity,
        item.price,
        (item.quantity * item.price).toFixed(2),
      ])
    );
    autoTable(doc, {
      head: [["Invoice #", "Date", "Customer", "Medicine", "Qty", "Price", "Total"]],
      body: tableData,
      startY: 25,
    });
    doc.save("Sales_Report.pdf");
  };

  const handleExportCSV = () => {
    const headers = ["Invoice #", "Date", "Customer", "Medicine", "Qty", "Price", "Total"];
    const rows = invoices.flatMap((inv) =>
      inv.items.map((item) => [
        inv.invoiceNumber,
        new Date(inv.date).toLocaleDateString(),
        inv.customer.name,
        item.name,
        item.quantity,
        item.price,
        (item.quantity * item.price).toFixed(2),
      ])
    );
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", "Sales_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="ml-64 p-6 mt-16">
      <h2 className="text-2xl font-bold mb-4">Advanced Sales Reports</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Total Sales</h3>
          <p className="text-3xl font-bold text-green-600">₹{totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Profit</h3>
          <p className="text-3xl font-bold text-blue-600">₹{profit.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Expired Stock</h3>
          <p className="text-3xl font-bold text-red-600">{expiredStock} items</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Monthly Sales Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlySales}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Stock Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stockDistData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {stockDistData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="date"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          className="p-2 border rounded"
          placeholder="From date"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          className="p-2 border rounded"
          placeholder="To date"
        />
        <input
          type="text"
          value={filters.customer}
          onChange={(e) => setFilters({ ...filters, customer: e.target.value })}
          className="p-2 border rounded"
          placeholder="Customer name"
        />
        <input
          type="text"
          value={filters.medicine}
          onChange={(e) => setFilters({ ...filters, medicine: e.target.value })}
          className="p-2 border rounded"
          placeholder="Medicine name"
        />
      </div>

      {/* Export Buttons */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleExportPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Download PDF
        </button>
        <button
          onClick={handleExportCSV}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Download CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-blue-100 text-gray-700 text-sm uppercase text-left">
              <th className="px-4 py-2">Invoice #</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Medicine</th>
              <th className="px-4 py-2">Qty</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No data found for selected filters.
                </td>
              </tr>
            ) : (
              invoices.map((inv) =>
                inv.items.map((item, i) => (
                  <tr key={`${inv._id}-${i}`} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{inv.invoiceNumber}</td>
                    <td className="px-4 py-2">
                      {new Date(inv.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">{inv.customer.name}</td>
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">{item.quantity}</td>
                    <td className="px-4 py-2">₹{item.price.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
