/** @format */

const { Fines, Users, Rentals } = require("../models");

// 🔹 Get all fines
const getFine = async (req, res) => {
  try {
    const fines = await Fines.findAll({
      include: [
        { model: Users, as: "user", attributes: ["id", "name", "email"] },
        { model: Rentals, as: "rental" }
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, data: fines });
  } catch (error) {
    console.error("Error fetching fines:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Create a fine
const createFine = async (req, res) => {
  const { reason, amount, rentalId, userId } = req.body;

  if (!reason || !amount || !rentalId || !userId) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: reason, amount, userId, rentalId",
    });
  }

  try {
    const fine = await Fines.create({ reason, amount, userId, rentalId });

    res.status(201).json({ success: true, message: "Fine created", data: fine });
  } catch (error) {
    console.error("Error creating fine:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Delete a fine
const deleteFine = async (req, res) => {
  const fineId = req.params.fineId;

  try {
    const fine = await Fines.findByPk(fineId);

    if (!fine) {
      return res.status(404).json({ success: false, message: "Fine not found" });
    }

    await fine.destroy();

    res.status(200).json({ success: true, message: "Fine deleted" });
  } catch (error) {
    console.error("Error deleting fine:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Update fine
const updateFine = async (req, res) => {
  const fineId = req.params.fineId;
  const { amount, reason } = req.body;

  try {
    const fine = await Fines.findByPk(fineId);

    if (!fine) {
      return res.status(404).json({ success: false, message: "Fine not found" });
    }

    await fine.update({
      amount: amount ?? fine.amount,
      reason: reason ?? fine.reason,
    });

    res.status(200).json({ success: true, message: "Fine updated", data: fine });
  } catch (error) {
    console.error("Error updating fine:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFine,
  createFine,
  deleteFine,
  updateFine,
};
