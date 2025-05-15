// routes/invoiceRoutes.js
const express = require("express");
const router = express.Router();
const {
  getInvoices,
  createInvoice,
  getInvoiceById,
  deleteInvoice,
} = require("../controllers/invoiceController");

// Error handling middleware
const handleErrors = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// Validation middleware
const validateInvoiceData = (req, res, next) => {
  const { customer, items } = req.body;
  
  if (!customer || !customer.name) {
    return res.status(400).json({ message: "Customer name is required" });
  }
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "At least one item is required" });
  }
  
  next();
};

// Routes
router.get("/", getInvoices);
router.post("/", validateInvoiceData, createInvoice);
router.get("/:id", getInvoiceById);
router.delete("/:id", deleteInvoice);

// Error handling middleware
router.use(handleErrors);

module.exports = router;
