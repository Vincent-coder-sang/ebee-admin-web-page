// server/routes/reportRoutes.js
/** @format */

const express = require("express");
const router = express.Router();
const {
  getReport,
  getReportById,
  generateSalesReport,
  generateInventoryReport,
  generateFeedbackReport,
  generateCustomReport,
  downloadReport,
  deleteReport,
  getReportStats,
  createReport
} = require("../controllers/reportController");
const { verifyToken } = require("../middlewares/AuthMiddleware");

// Basic report routes
router.get("/get", verifyToken, getReport);
router.get("/get/:reportId", verifyToken, getReportById);
router.delete("/delete/:reportId", verifyToken, deleteReport);
router.post("/create", verifyToken, createReport); // Added this

// Report generation routes
router.post("/generate/sales", verifyToken, generateSalesReport);
router.post("/generate/inventory", verifyToken, generateInventoryReport);
router.post("/generate/feedback", verifyToken, generateFeedbackReport);
router.post("/generate/custom", verifyToken, generateCustomReport);

// Download and stats
router.get("/download/:filename", verifyToken, downloadReport);
router.get("/stats", verifyToken, getReportStats);

module.exports = router;