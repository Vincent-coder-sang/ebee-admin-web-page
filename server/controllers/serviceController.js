/** @format */

const { Services, Users } = require("../models");

/**
 * =========================
 * CREATE SERVICE
 * =========================
 */
const createService = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, description, price } = req.body;

    console.log("🛠️ createService payload:", req.body);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: "name and price are required",
      });
    }

    const newService = await Services.create({
      name,
      description: description || null,
      price,
      userId,
    });

    console.log("✅ Service created:", newService.id);

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: newService,
    });
  } catch (error) {
    console.error("❌ createService error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =========================
 * UPDATE SERVICE
 * =========================
 */
const updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { name, description, price } = req.body;

    console.log("🛠️ updateService:", serviceId, req.body);

    const service = await Services.findByPk(serviceId, {
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Optional (future): ownership / role check
    // if (service.userId !== req.user.id) { ... }

    await service.update({
      ...(name && { name }),
      ...(description && { description }),
      ...(price && { price }),
    });

    const updatedService = await Services.findByPk(serviceId, {
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    console.log("✅ Service updated:", serviceId);

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: updatedService,
    });
  } catch (error) {
    console.error("❌ updateService error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =========================
 * DELETE SERVICE
 * =========================
 */
const deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    console.log("🗑️ deleteService:", serviceId);

    const service = await Services.findByPk(serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    await service.destroy();

    console.log("✅ Service deleted:", serviceId);

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("❌ deleteService error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =========================
 * GET SERVICE BY ID
 * =========================
 */
const getServiceById = async (req, res) => {
  try {
    const { serviceId } = req.params;

    console.log("🔍 getServiceById:", serviceId);

    const service = await Services.findByPk(serviceId, {
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("❌ getServiceById error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =========================
 * GET ALL SERVICES
 * =========================
 */
const getAllServices = async (req, res) => {
  try {
    console.log("📦 getAllServices called");

    const services = await Services.findAll({
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Services fetched successfully",
      data: services,
    });
  } catch (error) {
    console.error("❌ getAllServices error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createService,
  updateService,
  deleteService,
  getServiceById,
  getAllServices,
};
