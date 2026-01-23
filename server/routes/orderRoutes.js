/** @format */

// Import necessary modules
const express = require("express");
const {
  createOrderFromCart,
  deleteOrders,
  updateOrders,
  getOrders,
  getOrder,
  getMyOrders,
} = require("../controllers/orderController");
const { verifyToken } = require("../middlewares/AuthMiddleware");

const router = express.Router();

router.post("/create", verifyToken, createOrderFromCart);
router.delete("/delete/:orderId", verifyToken, deleteOrders);
router.put("/update/:orderId", verifyToken, updateOrders);
router.get("/get", verifyToken, getOrders);
router.get("/get/:orderId", verifyToken, getOrder);
// router.get("/user/:userId", verifyToken, getMyOrders);
router.get("/my", verifyToken, getMyOrders);


module.exports = router;
