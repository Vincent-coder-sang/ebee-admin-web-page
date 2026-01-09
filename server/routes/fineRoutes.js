const express = require("express");
const router = express.Router();
const {
  getFine,
  createFine,
  deleteFine,
  updateFine,
} = require("../controllers/fineController");

router.get("/get", getFine);
router.post("/create", createFine);
router.delete("/delete/:fineId", deleteFine);
router.put("/update/:fineId", updateFine);

module.exports = router;
