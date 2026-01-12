/** @format */

const { Dispatches, Orders, Users } = require("../models");
// controllers/dispatchController.js

const createDispatch = async (req, res) => {
  try {
    const { driverId, orderId, deliveryDate } = req.body;

    if (!driverId || !orderId || !deliveryDate) {
      return res.status(400).json({
        success: false,
        message: "driverId, orderId, and deliveryDate are required.",
      });
    }

    // Verify driver exists and is a driver
    const driver = await Users.findOne({ where: { id: driverId, userType: "driver" } });
    if (!driver) {
      return res.status(404).json({ success: false, message: "Driver not found or invalid role." });
    }

    // Verify order exists
    const order = await Orders.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // Prevent duplicate dispatch for same order
    const existingDispatch = await Dispatches.findOne({ where: { orderId } });
    if (existingDispatch) {
      return res.status(409).json({ success: false, message: "Dispatch already exists for this order." });
    }

    // Create dispatch
    const dispatch = await Dispatches.create({
      driverId,
      orderId,
      deliveryDate,
      status: "assigned",
    });

    return res.status(201).json({ success: true, message: "Dispatch assigned.", data: dispatch });
  } catch (error) {
    console.error("Dispatch assignment error:", error);
    return res.status(500).json({ success: false, message: "Failed to assign dispatch." });
  }
};

// 🔹 Get all dispatch records
const getDispatch = async (req, res) => {
  try {
    const dispatches = await Dispatches.findAll({
      include: [
        {
          model: Orders,
          as: "order",
          attributes: ["id", "orderStatus", "userId", "userAddressId"],
        },
        {
          model: Users,
          as: "driver",
          attributes: ["id", "name", "phoneNumber", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, data: dispatches });
  } catch (error) {
    console.error("Error fetching dispatches:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


const getDispatchById = async (req, res) => {
  const { id } = req.params;

  try {
    const dispatch = await Dispatches.findByPk(id, {
      include: [
        {
          model: Orders,
          as: "order",
          attributes: ["id", "orderStatus", "userId", "userAddressId"],
        },
        {
          model: Users, 
          as: "driver",
          attributes: ["id", "name", "phoneNumber", "email"],
        },
      ],
    });

    if (!dispatch) {
      return res.status(404).json({ success: false, message: "Dispatch not found" });
    }

    res.status(200).json({ success: true, data: dispatch });
  } catch (error) {
    console.error("Error fetching dispatch by ID:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}


// 🔹 Delete a dispatch
const deleteDispatch = async (req, res) => {
  const { dispatchId } = req.params;

  try {
    const dispatch = await Dispatches.findByPk(dispatchId);

    if (!dispatch) {
      return res.status(404).json({ success: false, message: "Dispatch not found" });
    }

    await dispatch.destroy();
    res.status(200).json({ success: true, message: "Dispatch deleted" });
  } catch (error) {
    console.error("Error deleting dispatch:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Update a dispatch
const updateDispatch = async (req, res) => {
  const { dispatchId } = req.params;
  const { deliveryDate, status, driverId } = req.body;

  try {
    const dispatch = await Dispatches.findByPk(dispatchId);

    if (!dispatch) {
      return res.status(404).json({ success: false, message: "Dispatch not found" });
    }

    await dispatch.update({
      deliveryDate: deliveryDate ?? dispatch.deliveryDate,
      status: status ?? dispatch.status,
      driverId: driverId ?? dispatch.driverId,
    });

    res.status(200).json({ success: true, message: "Dispatch updated", data: dispatch });
  } catch (error) {
    console.error("Error updating dispatch:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDispatch,
  createDispatch,
  deleteDispatch,
  updateDispatch,
  getDispatchById
};
