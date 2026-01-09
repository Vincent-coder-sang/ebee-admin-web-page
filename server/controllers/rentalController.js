/** @format */

const { Rentals, Users, Products } = require("../models");

// 🔹 Get all rentals
const getRental = async (req, res) => {
  try {
    const rentals = await Rentals.findAll({
      include: [
        { model: Users, as: "user", attributes: ["id", "name", "email"] },
        { model: Products, as: "product", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, data: rentals });
  } catch (error) {
    console.error("Error fetching rentals:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Create a new rental
const createRental = async (req, res) => {
  const { productId, rentEnd, rentStart, price, status } = req.body;
  const userId = req.user?.id;

  if (!rentEnd || !rentStart || !productId || !price) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: userId, productId, startDate, endDate",
    });
  }

  if(!userId) {
    return res.status(401).json({
      success: false,
      message: "Please login to create a rental",
    });
  }

  try {
    const newRental = await Rentals.create({
      productId, rentEnd, rentStart, price, status, userId
    });

    res.status(201).json({ success: true, message: "Rental created", data: newRental });
  } catch (error) {
    console.error("Error creating rental:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Delete rental
const deleteRental = async (req, res) => {
  const rentalId = req.params.id;

  try {
    const rental = await Rentals.findByPk(rentalId);

    if (!rental) {
      return res.status(404).json({ success: false, message: "Rental not found" });
    }

    await rental.destroy();

    res.status(200).json({ success: true, message: "Rental deleted" });
  } catch (error) {
    console.error("Error deleting rental:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Update rental
const updateRental = async (req, res) => {
  const rentalId = req.params.id;
  const { productId, rentEnd, rentStart, price, status } = req.body;

  try {
    const rental = await Rentals.findByPk(rentalId);

    if (!rental) {
      return res.status(404).json({ success: false, message: "Rental not found" });
    }

    await rental.update({
      productId: productId || rental.productId,
      rentStart: rentStart || rental.rentStart,
      rentEnd: rentEnd || rental.rentEnd,
      price: price || rental.price,
      returnDate: req.body.returnDate || rental.returnDate,
      status: status || rental.status,
      userId: req.user?.id || rental.userId, // Ensure userId is set
    });

    res.status(200).json({ success: true, message: "Rental updated", data: rental });
  } catch (error) {
    console.error("Error updating rental:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Export all
module.exports = {
  getRental,
  createRental,
  deleteRental,
  updateRental,
};
