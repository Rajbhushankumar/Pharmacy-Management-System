import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const [medicineCount, setMedicineCount] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const [lowStock, setLowStock] = useState([]);
  const [salesChartData, setSalesChartData] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]; // e.g. 2025-04-15

      // Medicines
      const medRes = await axios.get("http://localhost:5000/api/medicines");
      const meds = medRes.data;
      setMedicineCount(meds.length);

      const expired = meds.filter((m) => new Date(m.expiry) < new Date());
      setExpiredCount(expired.length);

      const lowStockMeds = meds.filter((m) => m.quantity < 10);
      setLowStock(lowStockMeds);

      // Invoices
      const invRes = await axios.get("http://localhost:5000/api/invoices");
      const invoices = invRes.data;

      const total = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
      setTotalSales(total);

      const todayOnly = invoices.filter(
        (i) => new Date(i.date).toISOString().split("T")[0] === today
      );
      const todayTotal = todayOnly.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
      setTodaySales(todayTotal);

      // Chart data: Last 7 days
      const past7Days = [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split("T")[0];

        const daySales = invoices
          .filter((i) => i.date && i.date.startsWith(dateStr))
          .reduce((sum, i) => sum + (i.totalAmount || 0), 0);

        return {
          date: new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          sales: daySales,
        };
      });

      setSalesChartData(past7Days);
    } catch (err) {
      console.error("Dashboard fetch error", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="ml-64 p-6 mt-16">
      <h2 className="text-2xl font-bold mb-6">Welcome to Medihub</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <h3 className="text-lg font-semibold mb-2">Total Medicines</h3>
          <p className="text-3xl font-bold text-blue-700">{medicineCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
          <p className="text-3xl font-bold text-green-600">₹ {totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <h3 className="text-lg font-semibold mb-2">Today's Sales</h3>
          <p className="text-3xl font-bold text-yellow-600">₹ {todaySales.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <h3 className="text-lg font-semibold mb-2">Expired Stock</h3>
          <p className="text-3xl font-bold text-red-600">{expiredCount}</p>
        </div>
      </div>

      {/* 🔻 Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="bg-red-100 border border-red-300 text-red-800 rounded-xl p-4 mb-8">
          <h3 className="font-semibold mb-2">⚠️ Low Stock Alert (Qty &lt; 10):</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {lowStock.map((m) => (
              <li key={m._id}>
                {m.name} — {m.quantity} left
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 📊 Sales Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Sales - Last 7 Days</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesChartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
