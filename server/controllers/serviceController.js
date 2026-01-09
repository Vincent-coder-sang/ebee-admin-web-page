const { Services, Users } = require("../models");

const createService = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const userId = req.user?.id;
    const newService = await Services.create({
      name,
      description,
      price,
      userId,
    });

    res.status(200).json({ success: true, data: newService, message: "Service created successfully" });
  } catch (error) {
   
    res.status(500).json({ success: false, message: error.message });
  }
};
const updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { name, description, price } = req.body;

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
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    service.name = name || service.name;
    service.description = description || service.description;
    service.price = price || service.price;

    await service.save();
    
    // Re-fetch to get updated data with user
    const updatedService = await Services.findByPk(serviceId, {
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });
    
    res.status(200).json({ 
      success: true, 
      message: "Service updated successfully",
      data: updatedService 
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await Services.findByPk(serviceId);

    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    await service.destroy();
    res
      .status(200)
      .json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getServiceById = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await Services.findByPk(serviceId, {
      include: [{ model: Users, as: "user" }],
    });

    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    res.status(200).json({ success: true, data: service });
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllServices = async (req, res) => {
  try {
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

    res.status(200).json({
      success: true,
      message: "Services fetched successfully",
      data: services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createService,
  updateService,
  deleteService,
  getServiceById,
  getAllServices,
};
