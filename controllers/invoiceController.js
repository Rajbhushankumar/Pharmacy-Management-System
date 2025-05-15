// controllers/invoiceController.js
const Invoice = require("../models/Invoice");
const Medicine = require("../models/Medicine");

exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .sort({ date: -1 })
      .select('-__v');
    res.json(invoices);
  } catch (err) {
    console.error("Error fetching invoices:", err);
    res.status(500).json({ 
      message: "Server error while fetching invoices",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const { customer, items, totalAmount } = req.body;

    // Log incoming request data
    console.log('Creating invoice with data:', {
      customer,
      itemsCount: items?.length,
      totalAmount
    });

    // Validate required fields
    if (!customer?.name) {
      return res.status(400).json({ 
        message: "Customer name is required",
        field: "customer.name"
      });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        message: "At least one item is required",
        field: "items"
      });
    }

    // Validate items and check stock availability
    for (const item of items) {
      if (!item.name || !item.quantity || !item.price) {
        return res.status(400).json({ 
          message: "Each item must have name, quantity, and price",
          field: "items",
          item: item
        });
      }
      if (item.quantity <= 0) {
        return res.status(400).json({ 
          message: "Item quantity must be greater than 0",
          field: "items.quantity",
          item: item
        });
      }
      if (item.price <= 0) {
        return res.status(400).json({ 
          message: "Item price must be greater than 0",
          field: "items.price",
          item: item
        });
      }

      // Check stock availability
      const medicine = await Medicine.findOne({ name: item.name });
      if (!medicine) {
        return res.status(400).json({ 
          message: `Medicine "${item.name}" not found in inventory`,
          field: "items.name",
          item: item
        });
      }
      if (medicine.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for "${item.name}". Available: ${medicine.quantity}`,
          field: "items.quantity",
          item: item,
          availableStock: medicine.quantity
        });
      }
    }

    // Calculate total amount if not provided
    const calculatedTotal = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    // Validate total amount if provided
    if (totalAmount && totalAmount !== calculatedTotal) {
      return res.status(400).json({
        message: "Provided total amount does not match calculated total",
        field: "totalAmount",
        provided: totalAmount,
        calculated: calculatedTotal
      });
    }

    // Generate unique invoice number
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4)}`;

    // Create invoice
    const invoice = new Invoice({
      invoiceNumber,
      customer,
      items,
      totalAmount: totalAmount || calculatedTotal,
      date: new Date()
    });

    try {
      // Save the invoice
      const savedInvoice = await invoice.save();
      console.log('Invoice saved successfully:', savedInvoice.invoiceNumber);

      // Update stock quantities
      for (const item of items) {
        const updateResult = await Medicine.findOneAndUpdate(
          { name: item.name },
          { $inc: { quantity: -item.quantity } },
          { new: true }
        );
        
        if (!updateResult) {
          // If stock update fails, delete the invoice to maintain consistency
          await Invoice.findByIdAndDelete(savedInvoice._id);
          throw new Error(`Failed to update stock for ${item.name}`);
        }
        console.log(`Stock updated for ${item.name}: ${updateResult.quantity} remaining`);
      }

      res.status(201).json({
        message: "Invoice created successfully",
        invoice: savedInvoice
      });
    } catch (err) {
      console.error('Operation failed:', {
        error: err.message,
        stack: err.stack,
        invoiceNumber
      });

      if (err.name === 'ValidationError') {
        return res.status(400).json({
          message: "Validation error in invoice data",
          errors: Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
          }))
        });
      }
      
      throw err;
    }
  } catch (err) {
    console.error("Error creating invoice:", {
      error: err.message,
      stack: err.stack,
      type: err.name,
      code: err.code
    });
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "Invoice number already exists",
        field: "invoiceNumber"
      });
    }
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: "Validation error in invoice data",
        errors: Object.values(err.errors).map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }

    // Handle specific error types
    if (err.name === 'MongoError') {
      return res.status(500).json({
        message: "Database error occurred",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        code: err.code
      });
    }

    res.status(500).json({ 
      message: "Error creating invoice",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      type: err.name,
      code: err.code
    });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).select('-__v');
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json(invoice);
  } catch (err) {
    console.error("Error fetching invoice:", err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }
    res.status(500).json({ 
      message: "Server error while fetching invoice",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const deleted = await Invoice.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    console.error("Error deleting invoice:", err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }
    res.status(500).json({ 
      message: "Server error while deleting invoice",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
