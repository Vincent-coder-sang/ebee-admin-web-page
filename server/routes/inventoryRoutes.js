/** @format */

const express = require("express");
const { getInventoryLogs, createInventoryLogs, deleteInventoryLogs } = require("../controllers/inventoryController");


const router = express.Router();

router.get("/get", getInventoryLogs);
router.post("/create", createInventoryLogs);
router.delete("/delete/:inventoryId", deleteInventoryLogs);

module.exports = router;
