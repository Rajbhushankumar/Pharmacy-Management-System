const Customer = require("../models/Customer");

// Get all customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Error fetching customers", error: error.message });
  }
};

// Add a new customer
exports.addCustomer = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    // Check if customer with same phone already exists
    const existingCustomer = await Customer.findOne({ phone: req.body.phone });
    if (existingCustomer) {
      return res.status(400).json({ message: "Customer with this phone number already exists" });
    }

    const customer = new Customer({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address
    });

    const savedCustomer = await customer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    console.error("Error adding customer:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
    }
    res.status(500).json({ message: "Error adding customer", error: error.message });
  }
};

// Update a customer
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Check if phone number is being updated and if it already exists
    if (req.body.phone && req.body.phone !== customer.phone) {
      const existingCustomer = await Customer.findOne({ phone: req.body.phone });
      if (existingCustomer) {
        return res.status(400).json({ message: "Customer with this phone number already exists" });
      }
    }

    Object.assign(customer, req.body);
    const updatedCustomer = await customer.save();
    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error("Error updating customer:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
    }
    res.status(500).json({ message: "Error updating customer", error: error.message });
  }
};

// Delete a customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    await Customer.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ message: "Error deleting customer", error: error.message });
  }
};
