const express = require("express");
const { getDispatch, createDispatch, updateDispatch, deleteDispatch } = require("../controllers/dispatchController");
const { verifyToken } = require("../middlewares/AuthMiddleware");
const router = express.Router();


router.get("/get",verifyToken, getDispatch);
router.post("/create", verifyToken, createDispatch);
router.put("/update/:dispatchId",verifyToken, updateDispatch);
router.delete("/delete/:dispatchId",verifyToken, deleteDispatch);

module.exports = router;
