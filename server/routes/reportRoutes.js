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
	getReportStats
} = require("../controllers/reportController");

// Authentication middleware
const { authenticate, authorize } = require("../middleware/authMiddleware");

// Apply authentication to all routes
router.use(authenticate);

// Basic report routes
router.get("/get", authorize(['admin', 'manager']), getReport);
router.get("/get/:id", authorize(['admin', 'manager']), getReportById);
router.delete("/delete/:id", authorize(['admin']), deleteReport);

// Report generation routes
router.post("/generate/sales", authorize(['admin', 'manager']), generateSalesReport);
router.post("/generate/inventory", authorize(['admin', 'manager']), generateInventoryReport);
router.post("/generate/feedback", authorize(['admin', 'manager']), generateFeedbackReport);
router.post("/generate/custom", authorize(['admin', 'manager']), generateCustomReport);

// Download and stats
router.get("/download/:filename", authorize(['admin', 'manager']), downloadReport);
router.get("/stats", authorize(['admin', 'manager']), getReportStats);

module.exports = router;