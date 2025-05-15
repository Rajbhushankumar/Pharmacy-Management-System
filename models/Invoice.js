// models/Invoice.js
const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: [true, "Invoice number is required"],
    unique: true,
    trim: true,
  },
  customer: {
    name: { 
      type: String, 
      required: [true, "Customer name is required"],
      trim: true,
    },
    phone: { 
      type: String, 
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^[0-9]{10}$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      }
    },
  },
  items: [{
    name: { 
      type: String, 
      required: [true, "Item name is required"],
      trim: true,
    },
    quantity: { 
      type: Number, 
      required: [true, "Item quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    price: { 
      type: Number, 
      required: [true, "Item price is required"],
      min: [0, "Price must be at least 0"],
    },
  }],
  totalAmount: { 
    type: Number, 
    required: [true, "Total amount is required"],
    min: [0, "Total amount must be at least 0"],
  },
  date: { 
    type: Date, 
    default: Date.now,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending',
  },
  notes: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add a virtual field for formatted date
invoiceSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Add a virtual field for formatted total
invoiceSchema.virtual('formattedTotal').get(function() {
  return `₹${this.totalAmount.toFixed(2)}`;
});

// Add a method to calculate total
invoiceSchema.methods.calculateTotal = function() {
  return this.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
};

// Add a pre-save hook to validate total amount
invoiceSchema.pre('save', function(next) {
  const calculatedTotal = this.calculateTotal();
  if (this.totalAmount !== calculatedTotal) {
    this.totalAmount = calculatedTotal;
  }
  next();
});

module.exports = mongoose.model("Invoice", invoiceSchema);
