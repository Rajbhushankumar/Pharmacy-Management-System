const express = require("express");
const router = express.Router();
const {
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
} = require("../controllers/medicineController");

router.get("/", getMedicines);
router.post("/", addMedicine);
router.put("/:id", updateMedicine);
router.delete("/:id", deleteMedicine);

module.exports = router;
