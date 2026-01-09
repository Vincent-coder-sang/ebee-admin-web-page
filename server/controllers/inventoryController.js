/** @format */

const { Inventories, Products, Orders } = require("../models");

// 🔹 Get all inventory logs
const getInventoryLogs = async (req, res) => {
  try {
    const logs = await Inventories.findAll({
      include: [
        { model: Products, as: "product", attributes: ["id", "name"] },
        { model: Orders, as: "order", attributes: ["id"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error("Error fetching inventory logs:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Create a new inventory log
const createInventoryLogs = async (req, res) => {
  const { quantity, changeType, reason, productId, orderId } = req.body;

  if (!quantity || !changeType || !reason || !productId) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: quantity, changeType, reason, productId",
    });
  }

  try {
    const log = await Inventories.create({
      quantity,
      changeType,
      reason,
      productId,
      orderId: orderId || null,
    });

    // Optionally update product stock
    const product = await Products.findByPk(productId);
    if (product) {
      const updatedStock =
        changeType === "increase"
          ? product.stockQuantity + quantity
          : product.stockQuantity - quantity;

      await product.update({
        stockQuantity: Math.max(updatedStock, 0),
      });
    }

    res.status(201).json({ success: true, message: "Inventory log created", data: log });
  } catch (error) {
    console.error("Error creating inventory log:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Delete an inventory log
const deleteInventoryLogs = async (req, res) => {
  const logId = req.params.id;

  try {
    const log = await Inventories.findByPk(logId);

    if (!log) {
      return res.status(404).json({ success: false, message: "Log not found" });
    }

    await log.destroy();

    res.status(200).json({ success: true, message: "Inventory log deleted" });
  } catch (error) {
    console.error("Error deleting inventory log:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getInventoryLogs,
  createInventoryLogs,
  deleteInventoryLogs,
};
