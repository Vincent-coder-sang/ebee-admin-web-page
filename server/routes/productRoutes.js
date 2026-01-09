// const necessary modules
const express = require("express");
const {
  createProducts,
  deleteProducts,
  updateProducts,
  getProducts,
  getProductById,
  searchProducts,

} = require("../controllers/productController");

const { upload } = require("../utils/cloudinary");
const { verifyToken } = require("../middlewares/AuthMiddleware");


const router = express.Router();


router.post("/create", upload.single("my_file"), verifyToken, createProducts);
router.delete("/delete/:productId", deleteProducts);
router.put("/update/:productId", upload.single("my_file"), verifyToken, updateProducts);
router.get("/get", getProducts);
router.get("/get/:productId", getProductById);
router.post("/search", searchProducts);


module.exports = router;
