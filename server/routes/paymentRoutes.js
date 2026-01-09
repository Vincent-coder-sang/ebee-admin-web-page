/** @format */
const express = require("express");
const { verifyToken, isAdmin } = require("../middlewares/AuthMiddleware");
const { getPaymentHistory, initiatePayheroSTKPush, handleCallback, approvePayments, getPaymentStatusByOrderId, getPaymentStatusByCheckoutRequestId  } = require("../controllers/paymentController");


const router = express.Router();


router.post("/stkpush", verifyToken, initiatePayheroSTKPush);
router.post("/callback", handleCallback);
router.get("/history", verifyToken,getPaymentHistory )//finance_manager
router.put("/update/:paymentId", verifyToken,  approvePayments)
router.get('/status/:checkoutRequestId', getPaymentStatusByCheckoutRequestId);


// Add to routes
router.get('/status/:orderId', getPaymentStatusByOrderId);

module.exports = router;
