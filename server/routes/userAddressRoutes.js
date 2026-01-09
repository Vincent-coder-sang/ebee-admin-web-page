// const necessary modules
const express = require("express");
const {
  createAddress,
  updateUserAddress,
  getUserAddress,
  deleteAddress
} = require("../controllers/userAddressController"); 
const { verifyTokenAndAuthorization, verifyToken } = require("../middlewares/AuthMiddleware");

const router = express.Router();

// Define routes
router.get("/get",verifyToken, getUserAddress);
router.post("/create", verifyToken, createAddress);
router.put("/update/:addressId", verifyToken,updateUserAddress);
router.delete("/delete/:addressId",verifyToken, deleteAddress);

module.exports = router;
