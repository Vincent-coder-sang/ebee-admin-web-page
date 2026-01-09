const express = require("express");
const router = express.Router();

const {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  getBookingsByUser,
} = require("../controllers/bookingController");
const { verifyToken } = require("../middlewares/AuthMiddleware");

router.get("/get", verifyToken, getBookings);
router.post("/create", verifyToken, createBooking);
router.put("/update/:bookingId", verifyToken, updateBooking);
router.delete("/delete/:bookingId", verifyToken, deleteBooking);
router.get("/get/:userId", verifyToken, getBookingsByUser);

module.exports = router;
