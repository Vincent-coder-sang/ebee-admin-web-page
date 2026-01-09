const express = require("express");
const router = express.Router();
const {
  getRental,
  createRental,
  deleteRental,
} = require("../controllers/rentalController");
const { verifyToken } = require("../middlewares/AuthMiddleware");

router.get("/get", verifyToken, getRental);
router.post("/create", verifyToken, createRental);
router.delete("/delete/:rentalId", verifyToken, deleteRental);

module.exports = router;
