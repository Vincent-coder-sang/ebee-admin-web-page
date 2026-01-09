// const necessary modules
const express = require("express");
const {
  deleteUser,
  getUsers,
  updateUser,
  getUserById,
  approveUser,
  approveUsers
} = require("../controllers/userController"); 
const { verifyToken } = require("../middlewares/AuthMiddleware");

const router = express.Router();

// Define routes
router.delete("/delete/:userId",verifyToken, deleteUser);
router.get("/get", verifyToken, getUsers);
router.put("/update/:userId", verifyToken, updateUser);
router.get("/get/:userId", verifyToken, getUserById);
router.put("/approve/:userId", verifyToken, approveUsers); // Approve user route
router.put("/approve", verifyToken, approveUser);

module.exports = router;
