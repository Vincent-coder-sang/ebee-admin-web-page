const express = require("express");
const router = express.Router();
const {
  createService,
  updateService,
  deleteService,
  getServiceById,
  getAllServices,
} = require("../controllers/serviceController");
const { verifyToken } = require("../middlewares/AuthMiddleware");

router.post("/create", verifyToken, createService);
router.put("/update/:serviceId", verifyToken, updateService);
router.delete("/delete/:serviceId", verifyToken, deleteService);
router.get("/get/:serviceId", verifyToken, getServiceById);
router.get("/get", verifyToken, getAllServices);

module.exports = router;
