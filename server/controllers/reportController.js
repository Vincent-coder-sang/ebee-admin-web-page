/** @format */

const { Reports, Users, Products, Orders, OrderItems, Feedbacks, Inventories } = require("../models");
const { Op, fn, col, literal } = require("sequelize");
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const {
	parseJSONField,
	stringifyJSONField,
	processReportForResponse,
	processReportsForResponse
} = require("../utils/jsonHelper");

// Ensure reports directory exists
const ensureReportsDir = () => {
	const dir = path.join(__dirname, '../reports');
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
	return dir;
};

// Helper: Generate Excel file
const generateExcel = async (data, columns, reportName) => {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('Report Data');

	// Add headers
	worksheet.columns = columns.map(col => ({
		header: col.header,
		key: col.key,
		width: col.width || 20
	}));

	// Style headers
	worksheet.getRow(1).eachCell((cell) => {
		cell.font = { bold: true, size: 12 };
		cell.fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FFE0E0E0' }
		};
		cell.border = {
			top: { style: 'thin' },
			left: { style: 'thin' },
			bottom: { style: 'thin' },
			right: { style: 'thin' }
		};
		cell.alignment = { vertical: 'middle', horizontal: 'center' };
	});

	// Add data rows
	data.forEach((row) => {
		const newRow = worksheet.addRow(row);
		newRow.eachCell((cell) => {
			cell.border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' }
			};
		});
	});

	// Auto-fit columns
	worksheet.columns.forEach(column => {
		let maxLength = 0;
		column.eachCell({ includeEmpty: true }, cell => {
			const columnLength = cell.value ? cell.value.toString().length : 10;
			if (columnLength > maxLength) {
				maxLength = columnLength;
			}
		});
		column.width = Math.min(maxLength + 2, 50);
	});

	const fileName = `${reportName.replace(/\s+/g, '_')}_${Date.now()}.xlsx`;
	const reportsDir = ensureReportsDir();
	const filePath = path.join(reportsDir, fileName);
	
	await workbook.xlsx.writeFile(filePath);
	return { fileName, filePath };
};

// Helper: Generate PDF file
const generatePDF = async (data, columns, reportName, summary = null) => {
	const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
	const fileName = `${reportName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
	const reportsDir = ensureReportsDir();
	const filePath = path.join(reportsDir, fileName);
	
	const stream = fs.createWriteStream(filePath);
	doc.pipe(stream);

	// Header
	doc.fontSize(20).font('Helvetica-Bold').text(reportName, { align: 'center' });
	doc.moveDown(0.5);
	doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
	
	if (summary) {
		doc.moveDown();
		doc.fontSize(12).font('Helvetica-Bold').text('Summary:', { underline: true });
		Object.entries(summary).forEach(([key, value]) => {
			doc.fontSize(10).text(`${key}: ${value}`, { indent: 20 });
		});
	}

	doc.moveDown(2);

	// Table setup
	const startX = 50;
	let currentY = doc.y;
	const pageWidth = 750;
	const colWidth = pageWidth / columns.length;

	// Table header
	doc.fontSize(10).font('Helvetica-Bold');
	columns.forEach((column, index) => {
		doc.text(column.header, startX + (index * colWidth), currentY, { 
			width: colWidth - 5,
			align: 'center'
		});
	});
	
	// Header underline
	currentY += 15;
	doc.moveTo(startX, currentY).lineTo(startX + pageWidth, currentY).stroke();
	currentY += 10;

	// Table data
	doc.fontSize(9).font('Helvetica');
	let rowCount = 0;
	
	data.forEach((row) => {
		// Check if we need a new page
		if (currentY > 500) {
			doc.addPage();
			currentY = 50;
			rowCount = 0;
			
			// Add header again on new page
			doc.fontSize(10).font('Helvetica-Bold');
			columns.forEach((column, index) => {
				doc.text(column.header, startX + (index * colWidth), currentY, { 
					width: colWidth - 5,
					align: 'center'
				});
			});
			currentY += 25;
		}

		columns.forEach((column, index) => {
			const value = row[column.key] !== undefined ? row[column.key].toString() : '';
			doc.text(value, startX + (index * colWidth), currentY, { 
				width: colWidth - 5,
				align: 'left'
			});
		});
		
		currentY += 20;
		rowCount++;
		
		// Add subtle row separator
		if (rowCount < data.length) {
			doc.moveTo(startX, currentY - 5).lineTo(startX + pageWidth, currentY - 5)
			   .strokeOpacity(0.2).stroke();
		}
	});

	// Footer
	doc.page.margins = { bottom: 50 };
	const bottomY = doc.page.height - 50;
	doc.fontSize(8).text(`Page ${doc.page.number}`, 50, bottomY, { align: 'center' });

	doc.end();

	return new Promise((resolve) => {
		stream.on('finish', () => {
			resolve({ fileName, filePath });
		});
	});
};

// 🔹 Get all reports
const getReport = async (req, res) => {
	try {
		const reports = await Reports.findAll({
			include: [
				{
					model: Users,
					as: "user",
					attributes: ["id", "name", "email", "userType"],
				},
			],
			order: [["createdAt", "DESC"]],
		});

		// Process reports to parse JSON fields
		const processedReports = processReportsForResponse(reports);

		res.status(200).json({ success: true, data: processedReports });
	} catch (error) {
		console.error("Error fetching reports:", error);
		res.status(500).json({ success: false, message: error.message });
	}
};

// 🔹 Get report by ID
const getReportById = async (req, res) => {
	const { id } = req.params;

	try {
		const report = await Reports.findByPk(id, {
			include: [
				{
					model: Users,
					as: "user",
					attributes: ["id", "name", "email", "userType"],
				},
			],
		});

		if (!report) {
			return res.status(404).json({ success: false, message: "Report not found" });
		}

		// Process report to parse JSON fields
		const processedReport = processReportForResponse(report);

		// Increment download count
		await report.update({ downloadCount: report.downloadCount + 1 });

		res.status(200).json({ success: true, data: processedReport });
	} catch (error) {
		console.error("Error fetching report by ID:", error);
		res.status(500).json({ success: false, message: error.message });
	}
};

// 🔹 Generate Sales Summary Report
const generateSalesReport = async (req, res) => {
	const { startDate, endDate, format = 'pdf' } = req.body;
	const userId = req.user.id;

	try {
		const whereCondition = {};
		if (startDate && endDate) {
			whereCondition.createdAt = {
				[Op.between]: [new Date(startDate), new Date(endDate)]
			};
		}

		// Fetch sales data
		const orders = await Orders.findAll({
			where: whereCondition,
			include: [
				{
					model: OrderItems,
					as: 'orderItems',
					include: [{
						model: Products,
						as: 'product',
						attributes: ['name', 'category']
					}]
				}
			],
			order: [['createdAt', 'DESC']]
		});

		// Process data for report
		const reportData = [];
		let totalRevenue = 0;
		let totalOrders = orders.length;
		let totalItems = 0;

		orders.forEach(order => {
			order.orderItems.forEach(item => {
				const itemTotal = item.quantity * item.price;
				totalRevenue += itemTotal;
				totalItems += item.quantity;
				
				reportData.push({
					orderId: order.id,
					customer: order.customerName || 'Unknown',
					product: item.product?.name || 'Unknown',
					category: item.product?.category || 'Unknown',
					quantity: item.quantity,
					unitPrice: item.price,
					total: itemTotal,
					date: order.createdAt.toLocaleDateString(),
					status: order.status
				});
			});
		});

		// Create report content as JSON string
		const reportContent = {
			totalRevenue,
			totalOrders,
			totalItems,
			averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0,
			period: `${startDate} to ${endDate}`,
			reportData: reportData.slice(0, 100) // Store first 100 items in content
		};

		const filters = { startDate, endDate };

		// Create report record
		const report = await Reports.create({
			userId,
			title: `Sales Report ${startDate || ''} to ${endDate || new Date().toLocaleDateString()}`,
			type: 'sales_summary',
			content: stringifyJSONField(reportContent), // Store as JSON string
			format,
			filters: stringifyJSONField(filters), // Store as JSON string
			startDate: startDate ? new Date(startDate) : null,
			endDate: endDate ? new Date(endDate) : null,
			period: 'custom'
		});

		// Generate file
		const columns = [
			{ header: 'Order ID', key: 'orderId', width: 15 },
			{ header: 'Customer', key: 'customer', width: 25 },
			{ header: 'Product', key: 'product', width: 25 },
			{ header: 'Category', key: 'category', width: 20 },
			{ header: 'Quantity', key: 'quantity', width: 15 },
			{ header: 'Unit Price ($)', key: 'unitPrice', width: 15 },
			{ header: 'Total ($)', key: 'total', width: 15 },
			{ header: 'Date', key: 'date', width: 15 },
			{ header: 'Status', key: 'status', width: 15 }
		];

		const summary = {
			'Total Revenue': `$${totalRevenue.toFixed(2)}`,
			'Total Orders': totalOrders,
			'Total Items Sold': totalItems,
			'Average Order Value': `$${(totalRevenue / (totalOrders || 1)).toFixed(2)}`,
			'Report Period': `${startDate || 'Beginning'} to ${endDate || new Date().toLocaleDateString()}`
		};

		let fileInfo;
		if (format === 'excel') {
			fileInfo = await generateExcel(reportData, columns, `Sales_Report_${Date.now()}`);
		} else {
			fileInfo = await generatePDF(reportData, columns, 'Sales Summary Report', summary);
		}

		// Update report with file URL
		await report.update({
			fileUrl: `/api/reports/download/${fileInfo.fileName}`,
			isGenerated: true
		});

		res.status(200).json({
			success: true,
			message: "Sales report generated successfully",
			data: {
				reportId: report.id,
				downloadUrl: `/api/reports/download/${fileInfo.fileName}`,
				fileName: fileInfo.fileName,
				summary
			},
		});
	} catch (error) {
		console.error("Error generating sales report:", error);
		res.status(500).json({ success: false, message: error.message });
	}
};

// 🔹 Generate Inventory Status Report
const generateInventoryReport = async (req, res) => {
	const { lowStockThreshold = 10, format = 'pdf' } = req.body;
	const userId = req.user.id;

	try {
		// Fetch inventory data
		const products = await Products.findAll({
			include: [{
				model: Inventories,
				as: 'inventoryLogs',
				attributes: [],
				required: false
			}],
			attributes: [
				'id',
				'name',
				'category',
				'price',
				'stockQuantity'
			]
		});

		// Process data for report
		const reportData = products.map(product => {
			const currentStock = product.stockQuantity || 0;
			const status = currentStock === 0 ? 'Out of Stock' :
						 currentStock <= lowStockThreshold ? 'Low Stock' : 'In Stock';
			
			return {
				productId: product.id,
				productName: product.name,
				category: product.category,
				currentStock: currentStock,
				price: product.price,
				status: status,
				value: (currentStock * product.price).toFixed(2)
			};
		});

		// Calculate summary
		const totalProducts = products.length;
		const outOfStock = products.filter(p => p.stockQuantity === 0).length;
		const lowStock = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= lowStockThreshold).length;
		const totalValue = reportData.reduce((sum, item) => sum + parseFloat(item.value), 0);

		// Create report content as JSON string
		const reportContent = {
			totalProducts,
			outOfStock,
			lowStock,
			inStock: totalProducts - outOfStock - lowStock,
			totalInventoryValue: totalValue,
			lowStockThreshold,
			reportData: reportData.slice(0, 100)
		};

		const filters = { lowStockThreshold };

		// Create report record
		const report = await Reports.create({
			userId,
			title: `Inventory Status Report`,
			type: 'inventory_status',
			content: stringifyJSONField(reportContent),
			format,
			filters: stringifyJSONField(filters),
			period: 'monthly'
		});

		// Generate file
		const columns = [
			{ header: 'Product ID', key: 'productId', width: 15 },
			{ header: 'Product Name', key: 'productName', width: 30 },
			{ header: 'Category', key: 'category', width: 20 },
			{ header: 'Current Stock', key: 'currentStock', width: 15 },
			{ header: 'Price ($)', key: 'price', width: 15 },
			{ header: 'Status', key: 'status', width: 15 },
			{ header: 'Value ($)', key: 'value', width: 15 }
		];

		const summary = {
			'Total Products': totalProducts,
			'In Stock': totalProducts - outOfStock - lowStock,
			'Low Stock': lowStock,
			'Out of Stock': outOfStock,
			'Total Inventory Value': `$${totalValue.toFixed(2)}`,
			'Low Stock Threshold': lowStockThreshold
		};

		let fileInfo;
		if (format === 'excel') {
			fileInfo = await generateExcel(reportData, columns, `Inventory_Report_${Date.now()}`);
		} else {
			fileInfo = await generatePDF(reportData, columns, 'Inventory Status Report', summary);
		}

		// Update report with file URL
		await report.update({
			fileUrl: `/api/reports/download/${fileInfo.fileName}`,
			isGenerated: true
		});

		res.status(200).json({
			success: true,
			message: "Inventory report generated successfully",
			data: {
				reportId: report.id,
				downloadUrl: `/api/reports/download/${fileInfo.fileName}`,
				fileName: fileInfo.fileName,
				summary
			},
		});
	} catch (error) {
		console.error("Error generating inventory report:", error);
		res.status(500).json({ success: false, message: error.message });
	}
};

// 🔹 Generate Product Feedback Report
const generateFeedbackReport = async (req, res) => {
	const { minRating = 0, format = 'pdf' } = req.body;
	const userId = req.user.id;

	try {
		const feedbacks = await Feedbacks.findAll({
			where: {
				rating: { [Op.gte]: minRating }
			},
			include: [
				{
					model: Users,
					as: 'user',
					attributes: ['name', 'email']
				},
				{
					model: Products,
					as: 'product',
					attributes: ['name', 'category']
				}
			],
			order: [['createdAt', 'DESC']]
		});

		// Process data for report
		const reportData = feedbacks.map(feedback => ({
			feedbackId: feedback.id,
			productName: feedback.product?.name || 'Unknown',
			category: feedback.product?.category || 'Unknown',
			customerName: feedback.user?.name || 'Anonymous',
			rating: feedback.rating,
			stars: '★'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating),
			comment: feedback.comment || 'No comment',
			date: feedback.createdAt.toLocaleDateString()
		}));

		// Calculate summary
		const totalFeedbacks = feedbacks.length;
		const averageRating = feedbacks.length > 0 
			? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(2)
			: 0;
		const fiveStarCount = feedbacks.filter(f => f.rating === 5).length;
		const oneStarCount = feedbacks.filter(f => f.rating === 1).length;

		// Create report content as JSON string
		const reportContent = {
			totalFeedbacks,
			averageRating,
			fiveStarCount,
			oneStarCount,
			minRatingFilter: minRating,
			reportData: reportData.slice(0, 100)
		};

		const filters = { minRating };

		// Create report record
		const report = await Reports.create({
			userId,
			title: `Product Feedback Analysis`,
			type: 'feedback_analysis',
			content: stringifyJSONField(reportContent),
			format,
			filters: stringifyJSONField(filters),
			period: 'monthly'
		});

		// Generate file
		const columns = [
			{ header: 'Feedback ID', key: 'feedbackId', width: 15 },
			{ header: 'Product', key: 'productName', width: 25 },
			{ header: 'Category', key: 'category', width: 20 },
			{ header: 'Customer', key: 'customerName', width: 25 },
			{ header: 'Rating', key: 'rating', width: 15 },
			{ header: 'Stars', key: 'stars', width: 15 },
			{ header: 'Comment', key: 'comment', width: 40 },
			{ header: 'Date', key: 'date', width: 15 }
		];

		const summary = {
			'Total Feedbacks': totalFeedbacks,
			'Average Rating': averageRating,
			'5-Star Ratings': fiveStarCount,
			'1-Star Ratings': oneStarCount,
			'Min Rating Filter': minRating
		};

		let fileInfo;
		if (format === 'excel') {
			fileInfo = await generateExcel(reportData, columns, `Feedback_Report_${Date.now()}`);
		} else {
			fileInfo = await generatePDF(reportData, columns, 'Product Feedback Analysis', summary);
		}

		// Update report with file URL
		await report.update({
			fileUrl: `/api/reports/download/${fileInfo.fileName}`,
			isGenerated: true
		});

		res.status(200).json({
			success: true,
			message: "Feedback report generated successfully",
			data: {
				reportId: report.id,
				downloadUrl: `/api/reports/download/${fileInfo.fileName}`,
				fileName: fileInfo.fileName,
				summary
			},
		});
	} catch (error) {
		console.error("Error generating feedback report:", error);
		res.status(500).json({ success: false, message: error.message });
	}
};

// 🔹 Download report file
const downloadReport = async (req, res) => {
	const { filename } = req.params;
	const reportsDir = path.join(__dirname, '../reports');
	const filePath = path.join(reportsDir, filename);

	if (!fs.existsSync(filePath)) {
		return res.status(404).json({ success: false, message: "File not found" });
	}

	res.download(filePath, filename, (err) => {
		if (err) {
			console.error("Error downloading file:", err);
			res.status(500).json({ success: false, message: "Error downloading file" });
		}
	});
};

// 🔹 Delete a report
const deleteReport = async (req, res) => {
	const reportId = req.params.id;

	try {
		const report = await Reports.findByPk(reportId);

		if (!report) {
			return res.status(404).json({ success: false, message: "Report not found" });
		}

		// Delete file if exists
		if (report.fileUrl) {
			const filename = report.fileUrl.split('/').pop();
			const filePath = path.join(__dirname, '../reports', filename);
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		}

		await report.destroy();

		res.status(200).json({ success: true, message: "Report deleted successfully" });
	} catch (error) {
		console.error("Error deleting report:", error);
		res.status(500).json({ success: false, message: error.message });
	}
};

// 🔹 Get report statistics
const getReportStats = async (req, res) => {
	try {
		const stats = await Reports.findAll({
			attributes: [
				'type',
				[fn('COUNT', col('id')), 'count'],
				[fn('SUM', col('downloadCount')), 'totalDownloads']
			],
			group: ['type'],
			raw: true
		});

		const totalReports = await Reports.count();
		const totalDownloads = await Reports.sum('downloadCount') || 0;

		// Get recent reports and process them
		const recentReports = await Reports.findAll({
			limit: 5,
			order: [['createdAt', 'DESC']],
			include: [{
				model: Users,
				as: 'user',
				attributes: ['name']
			}]
		});

		const processedRecentReports = processReportsForResponse(recentReports);

		res.status(200).json({
			success: true,
			data: {
				totalReports,
				totalDownloads,
				byType: stats,
				recentReports: processedRecentReports
			}
		});
	} catch (error) {
		console.error("Error fetching report stats:", error);
		res.status(500).json({ success: false, message: error.message });
	}
};

module.exports = {
	getReport,
	getReportById,
	generateSalesReport,
	generateInventoryReport,
	generateFeedbackReport,
	downloadReport,
	deleteReport,
	getReportStats
};