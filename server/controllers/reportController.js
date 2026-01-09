/** @format */

const { Reports, Users } = require("../models");

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

    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Create a new report
const createReport = async (req, res) => {
  const { title, description, reportType, userId } = req.body;

  if (!title || !description || !userId) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: title, description, userId",
    });
  }

  try {
    const report = await Reports.create({
      title,
      description,
      reportType: reportType || "issue",
      userId,
    });

    res.status(201).json({ success: true, message: "Report created", data: report });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Delete a report
const deleteReport = async (req, res) => {
  const reportId = req.params.id;

  try {
    const report = await Reports.findByPk(reportId);

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    await report.destroy();

    res.status(200).json({ success: true, message: "Report deleted" });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Export controller methods
module.exports = {
  getReport,
  createReport,
  deleteReport,
};
