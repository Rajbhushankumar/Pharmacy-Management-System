import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

const InvoiceHistory = () => {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/invoices");
      setInvoices(res.data);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      toast.error("Failed to load invoices. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: selectedInvoice?.invoiceNumber || "Invoice",
    onAfterPrint: () => toast.success("Printed successfully"),
    onPrintError: () => toast.error("Failed to print invoice"),
  });

  const handleDownloadPDF = () => {
    if (!selectedInvoice) return;

    try {
      const doc = new jsPDF();
      const total = selectedInvoice.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      doc.text(`Invoice #: ${selectedInvoice.invoiceNumber}`, 10, 10);
      doc.text(`Date: ${new Date(selectedInvoice.date).toLocaleDateString()}`, 10, 20);
      doc.text(`Customer: ${selectedInvoice.customer?.name || "Unknown"}`, 10, 30);
      doc.text(`Phone: ${selectedInvoice.customer?.phone || "N/A"}`, 10, 40);

      autoTable(doc, {
        head: [["Medicine", "Qty", "Price", "Total"]],
        body: selectedInvoice.items.map((item) => [
          item.name,
          item.quantity,
          `₹${item.price.toFixed(2)}`,
          `₹${(item.quantity * item.price).toFixed(2)}`,
        ]),
        startY: 50,
      });

      doc.text(`Grand Total: ₹${total.toFixed(2)}`, 10, doc.lastAutoTable.finalY + 10);
      doc.save(`${selectedInvoice.invoiceNumber || "Invoice"}.pdf`);
      toast.success("PDF downloaded successfully");
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error("Failed to generate PDF");
    }
  };

  const filtered = invoices.filter((inv) =>
    inv.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="ml-64 p-6 mt-16">
      <h2 className="text-2xl font-bold mb-4">Invoice History</h2>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by customer name or invoice #"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded w-full md:w-1/3"
        />
        <button
          onClick={fetchInvoices}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading invoices...</div>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-blue-100 text-gray-700 text-sm uppercase text-left">
                <th className="px-4 py-2">Invoice #</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Total (₹)</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const total = inv.items.reduce(
                    (sum, item) => sum + item.quantity * item.price,
                    0
                  );
                  return (
                    <tr key={inv._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{inv.invoiceNumber}</td>
                      <td className="px-4 py-2">
                        {new Date(inv.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">{inv.customer?.name || "Unknown"}</td>
                      <td className="px-4 py-2">₹{total.toFixed(2)}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow p-6 max-h-[80vh] overflow-y-auto">
            <div ref={printRef}>
              <h3 className="text-xl font-bold mb-2">
                {selectedInvoice.invoiceNumber}
              </h3>
              <p className="text-sm text-gray-500">
                Date: {new Date(selectedInvoice.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                Customer: {selectedInvoice.customer?.name || "Unknown"} (
                {selectedInvoice.customer?.phone || "N/A"})
              </p>

              <table className="min-w-full table-auto border mb-4">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-sm uppercase text-left">
                    <th className="px-3 py-2">Medicine</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">Price</th>
                    <th className="px-3 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, i) => (
                    <tr key={i} className="border-b text-sm">
                      <td className="px-3 py-2">{item.name}</td>
                      <td className="px-3 py-2">{item.quantity}</td>
                      <td className="px-3 py-2">₹{item.price.toFixed(2)}</td>
                      <td className="px-3 py-2">
                        ₹{(item.quantity * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-right font-bold text-green-600 text-lg">
                Grand Total: ₹
                {selectedInvoice.items
                  .reduce((sum, item) => sum + item.quantity * item.price, 0)
                  .toFixed(2)}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Print
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceHistory;
