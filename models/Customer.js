const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Customer name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters long"]
  },
  phone: { 
    type: String, 
    required: [true, "Phone number is required"],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  email: { 
    type: String, 
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { 
      type: String, 
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^[0-9]{6}$/.test(v);
        },
        message: props => `${props.value} is not a valid pincode!`
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add a virtual field for formatted phone
customerSchema.virtual('formattedPhone').get(function() {
  return this.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
});

// Add a method to get full address
customerSchema.methods.getFullAddress = function() {
  if (!this.address) return '';
  const { street, city, state, pincode } = this.address;
  return `${street}, ${city}, ${state} ${pincode}`.trim();
};

module.exports = mongoose.model("Customer", customerSchema);
