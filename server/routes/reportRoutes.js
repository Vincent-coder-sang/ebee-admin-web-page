const express = require("express");
const router = express.Router();
const {
  getReport,
  createReport,
  deleteReport,
} = require("../controllers/reportController");

router.get("/get", getReport);
router.post("/create", createReport);
router.delete("/delete/:reportId", deleteReport);

module.exports = router;
