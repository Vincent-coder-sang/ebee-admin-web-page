/** @format */

const { Bookings, Services, Users } = require("../models");

const getBookings = async (req, res) => {
  try {
    const bookings = await Bookings.findAll({
      include: [
        { model: Services, as: "service", attributes: ["id", "name", "description"] },
        { model: Users, as: "user", attributes: ["id", "name", "email"] },
        { model: Users, as: "technician", attributes: ["id", "name", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const userId = req.user?.id;
   
    const { serviceId, notes } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login to book a service",
      });
    }

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
    }

    const service = await Services.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const booking = await Bookings.create({
      serviceId,
      userId,
      status: "pending",
      notes: notes || null,
      assignedTo: null
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:  error.message,
    });

  }
};

const updateBooking = async (req, res) => {
  const { bookingId } = req.params;
  const { status, notes, assignedTo } = req.body;

  try {
    const booking = await Bookings.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Optional: validate technician existence
    if (assignedTo) {
      const technician = await Users.findByPk(assignedTo);
      if (!technician) {
        return res.status(404).json({ success: false, message: "Assigned technician not found." });
      }
    }

    await booking.update({
      ...(status && { status }),
      ...(notes && { notes }),
      ...(assignedTo && { assignedTo }),
    });

    res.status(200).json({ success: true, message: "Booking updated", data: booking });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBooking = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await Bookings.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    await booking.destroy();

    res.status(200).json({ success: true, message: "Booking deleted" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBookingsByUser = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const bookings = await Bookings.findAll({
      where: { userId },
      include: [
        { model: Services, as: "service" },
        { model: Users, as: "technician", attributes: ["id", "name", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  getBookingsByUser,
};
