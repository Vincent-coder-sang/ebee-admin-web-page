// server/controllers/reportController.js
/** @format */

const { Reports, Users, Products, Orders, OrderItems, Feedbacks } = require("../models");
const { Op } = require("sequelize");

// Simple JSON helper functions inline (NO IMPORT)
const parseJSONField = (fieldValue) => {
  if (!fieldValue) return {};
  if (typeof fieldValue === 'string') {
    try {
      return JSON.parse(fieldValue);
    } catch (error) {
      return { text: fieldValue };
    }
  }
  return fieldValue;
};

const stringifyJSONField = (fieldValue) => {
  if (typeof fieldValue === 'object' || Array.isArray(fieldValue)) {
    return JSON.stringify(fieldValue);
  }
  if (typeof fieldValue === 'string') {
    try {
      JSON.parse(fieldValue);
      return fieldValue;
    } catch (error) {
      return JSON.stringify({ text: fieldValue });
    }
  }
  return JSON.stringify({});
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
    const processedReports = reports.map(report => {
      const processed = { ...report.dataValues };
      if (processed.content) {
        processed.content = parseJSONField(processed.content);
      }
      if (processed.filters) {
        processed.filters = parseJSONField(processed.filters);
      }
      return processed;
    });

    res.status(200).json({ success: true, data: processedReports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Get report by ID - FIXED
const getReportById = async (req, res) => {
  const reportId = req.params.reportId;

  try {
    const report = await Reports.findByPk(reportId, {
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

    // Process report
    const processed = { ...report.dataValues };
    if (processed.content) {
      processed.content = parseJSONField(processed.content);
    }
    if (processed.filters) {
      processed.filters = parseJSONField(processed.filters);
    }

    // Increment download count
    await report.update({ downloadCount: report.downloadCount + 1 });

    res.status(200).json({ success: true, data: processed });
  } catch (error) {
    console.error("Error fetching report by ID:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Generate Sales Report
const generateSalesReport = async (req, res) => {
  const { startDate, endDate, format = 'json' } = req.body;
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
        },
        {
          model: Users,
          as: 'user',
          attributes: ['name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 100
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
          customer: order.user?.name || 'Unknown',
          customerEmail: order.user?.email || 'N/A',
          product: item.product?.name || 'Unknown',
          category: item.product?.category || 'Unknown',
          quantity: item.quantity,
          unitPrice: item.price,
          total: itemTotal,
          date: order.createdAt.toISOString().split('T')[0],
          status: order.status
        });
      });
    });

    // Create report record
    const reportContent = {
      totalRevenue,
      totalOrders,
      totalItems,
      averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0,
      period: `${startDate || 'Beginning'} to ${endDate || 'Now'}`,
      reportData: reportData
    };

    const filters = { startDate, endDate, format };

    const report = await Reports.create({
      userId,
      title: `Sales Report ${startDate || ''} to ${endDate || new Date().toLocaleDateString()}`,
      type: 'sales_summary',
      content: stringifyJSONField(reportContent),
      format,
      filters: stringifyJSONField(filters),
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      period: 'custom',
      isGenerated: true
    });

    res.status(200).json({
      success: true,
      message: "Sales report generated successfully",
      data: {
        reportId: report.id,
        summary: {
          totalRevenue: `$${totalRevenue.toFixed(2)}`,
          totalOrders,
          totalItems,
          averageOrderValue: `$${(totalRevenue / (totalOrders || 1)).toFixed(2)}`
        },
        data: reportData,
        rawData: reportContent
      },
    });
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Generate Feedback Report
const generateFeedbackReport = async (req, res) => {
  const { minRating = 0, format = 'json' } = req.body;
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
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    // Process data for report
    const reportData = feedbacks.map(feedback => ({
      feedbackId: feedback.id,
      productName: feedback.product?.name || 'Unknown',
      category: feedback.product?.category || 'Unknown',
      customerName: feedback.user?.name || 'Anonymous',
      customerEmail: feedback.user?.email || 'N/A',
      rating: feedback.rating,
      stars: '★'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating),
      comment: feedback.comment || 'No comment',
      date: feedback.createdAt.toISOString().split('T')[0]
    }));

    // Calculate summary
    const totalFeedbacks = feedbacks.length;
    const averageRating = feedbacks.length > 0 
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(2)
      : 0;
    const fiveStarCount = feedbacks.filter(f => f.rating === 5).length;
    const oneStarCount = feedbacks.filter(f => f.rating === 1).length;

    // Create report record
    const reportContent = {
      totalFeedbacks,
      averageRating,
      fiveStarCount,
      oneStarCount,
      minRatingFilter: minRating,
      reportData: reportData
    };

    const filters = { minRating, format };

    const report = await Reports.create({
      userId,
      title: `Product Feedback Analysis`,
      type: 'feedback_analysis',
      content: stringifyJSONField(reportContent),
      format,
      filters: stringifyJSONField(filters),
      period: 'monthly',
      isGenerated: true
    });

    res.status(200).json({
      success: true,
      message: "Feedback report generated successfully",
      data: {
        reportId: report.id,
        summary: {
          totalFeedbacks,
          averageRating,
          fiveStarCount,
          oneStarCount,
          minRatingFilter: minRating
        },
        data: reportData,
        rawData: reportContent
      },
    });
  } catch (error) {
    console.error("Error generating feedback report:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Generate Custom Report
const generateCustomReport = async (req, res) => {
  const { title, content, filters, format = 'json' } = req.body;
  const userId = req.user.id;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: title, content",
    });
  }

  try {
    const report = await Reports.create({
      title,
      content: stringifyJSONField(content),
      userId,
      type: 'custom',
      format,
      filters: stringifyJSONField(filters || {}),
      isGenerated: true
    });

    res.status(200).json({
      success: true,
      message: "Custom report created successfully",
      data: {
        reportId: report.id,
        content: parseJSONField(report.content),
        filters: parseJSONField(report.filters)
      }
    });
  } catch (error) {
    console.error("Error creating custom report:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Delete a report - FIXED
const deleteReport = async (req, res) => {
  const reportId = req.params.reportId;

  try {
    const report = await Reports.findByPk(reportId);

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    await report.destroy();

    res.status(200).json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Get report statistics - FIXED
const getReportStats = async (req, res) => {
  try {
    const { sequelize } = require("../models");
    
    const stats = await Reports.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('downloadCount')), 'totalDownloads']
      ],
      group: ['type'],
      raw: true
    });

    const totalReports = await Reports.count();
    const totalDownloads = await Reports.sum('downloadCount') || 0;

    // Get recent reports
    const recentReports = await Reports.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{
        model: Users,
        as: 'user',
        attributes: ['name']
      }]
    });

    const processedRecentReports = recentReports.map(report => {
      const processed = { ...report.dataValues };
      if (processed.content) {
        processed.content = parseJSONField(processed.content);
      }
      return processed;
    });

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

// 🔹 Download report (placeholder)
const downloadReport = async (req, res) => {
  const { filename } = req.params;
  
  res.status(200).json({
    success: true,
    message: "File download would be implemented here",
    filename
  });
};

// Create report (for compatibility with old routes)
const createReport = async (req, res) => {
  const { title, content, userId, type = 'custom' } = req.body;

  if (!title || !content || !userId) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: title, content, userId",
    });
  }

  try {
    const report = await Reports.create({
      title,
      content: stringifyJSONField(content),
      userId,
      type,
      isGenerated: true
    });

    res.status(201).json({ 
      success: true, 
      message: "Report created",
      data: {
        ...report.dataValues,
        content: parseJSONField(report.content)
      }
    });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Placeholder for inventory report (since it's referenced in routes)
const generateInventoryReport = async (req, res) => {
  res.status(501).json({
    success: false,
    message: "Inventory report not implemented yet"
  });
};

module.exports = {
  getReport,
  getReportById,
  generateSalesReport,
  generateInventoryReport, // Added placeholder
  generateFeedbackReport,
  generateCustomReport,
  downloadReport,
  deleteReport,
  getReportStats,
  createReport
};