const Medicine = require("../models/Medicine");

// Get all medicines
exports.getMedicines = async (req, res) => {
  try {
    const meds = await Medicine.find();
    res.json(meds);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Add new medicine
exports.addMedicine = async (req, res) => {
  try {
    const med = new Medicine(req.body);
    await med.save();
    res.status(201).json(med);
  } catch (err) {
    res.status(400).json({ message: "Invalid data" });
  }
};

// Update medicine
exports.updateMedicine = async (req, res) => {
  try {
    const updated = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Update failed" });
  }
};

// Delete medicine
exports.deleteMedicine = async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ message: "Medicine deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};
