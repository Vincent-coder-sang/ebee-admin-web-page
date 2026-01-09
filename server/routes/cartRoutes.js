/** @format */

const express = require("express");
const {
  clearCart,
  addProductToCart,
  removeItemFromCart,
  getCart,
  decreaseProductQuantity,
  increaseProductQuantity,
} = require("../controllers/cartController");

const { verifyToken } = require("../middlewares/AuthMiddleware");

const router = express.Router();

// GET cart for user
router.get("/get/:userId", verifyToken, getCart); // ✅ done

// Clear user's cart
router.get("/clear/:userId", verifyToken, clearCart); // ✅ done

// Add product to cart
router.post("/add", verifyToken, addProductToCart); // ✅ done

// Remove one item from cart
router.delete("/delete/:userId/:cartItemId", verifyToken, removeItemFromCart); // ✅ done

// Decrease quantity
router.put("/update/:cartItemId/decrease", verifyToken, decreaseProductQuantity); // ✅ done

// Increase quantity
router.put("/update/:cartItemId/increase", verifyToken, increaseProductQuantity); // ✅ done

module.exports = router;
