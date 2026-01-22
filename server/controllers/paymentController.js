/** @format */
const axios = require("axios");
const { Payments, Users, Orders } = require("../models");
const { Op, where } = require("sequelize");

// Payhero API credentials
const apiUsername = process.env.PAYHERO_API_USERNAME || "LykioY8LI38TwLWSEOpX";
const apiPassword =
  process.env.PAYHERO_API_PASSWORD ||
  "blP4TJA0O8yVtyH4G7U7AzpwktnTJOx31THnoPzM";
const encodedCredentials = Buffer.from(
  `${apiUsername}:${apiPassword}`
).toString("base64");

const initiatePayheroSTKPush = async (req, res) => {
  try {
    const { phone, orderId, amount } = req.body;
    const userId = req.user.id;

    if (!phone || !orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Phone and orderId are required.",
      });
    }

    // 🔍 Fetch order
    const order = await Orders.findByPk(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Order already paid.",
      });
    }



    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount.",
      });
    }

    const formattedPhone = phone.startsWith("0")
      ? `254${phone.slice(1)}`
      : phone;

    const reference = `PAY-${userId}-${Date.now()}-${orderId}`;

    // ⛔ Prevent duplicate pending payments
    const existingPayment = await Payments.findOne({
      where: {
        orderId,
        status: {
          [Op.in]: ["Pending", "QUEUED", null],
        },
      },
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment already in progress for this order.",
      });
    }

    // 📡 Send STK Push
    const response = await axios.post(
      "https://backend.payhero.co.ke/api/v2/payments",
      {
        amount,
        phone_number: formattedPhone,
        channel_id: 2409,
        provider: "m-pesa",
        external_reference: reference,
        callback_url:
          process.env.PAYMENT_CALLBACK_URL ||
          "https://ebee-admin-kjn8.onrender.com/api/payment/callback",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${encodedCredentials}`,
        },
      }
    );

    const paymentData = response.data;

    if (!paymentData?.CheckoutRequestID) {
      return res.status(500).json({
        success: false,
        message: "Failed to initiate payment.",
      });
    }

    // 💾 Save payment
    const payment = await Payments.create({
      amount,
      phoneNumber: formattedPhone,
      status: "QUEUED",
      reference,
      checkoutRequestId: paymentData.CheckoutRequestID,
      isApproved: false,
      userId,
      orderId,
    });

    return res.status(200).json({
      success: true,
      message: "STK Push sent.",
      data: paymentData,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("❌ STK Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================================
// ✅ PAYMENT CALLBACK
// ============================================================================
const handleCallback = async (req, res) => {
  try {
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ success: false });
    }

    const {
      Amount,
      Phone,
      Status,
      MpesaReceiptNumber,
      CheckoutRequestID,
      ExternalReference,
      ResultCode,
    } = response;

    const parts = ExternalReference.split("-");
    if (parts.length < 4) {
      return res.status(400).json({ success: false });
    }

    const userId = parts[1];
    const orderId = parts[3];

    const order = await Orders.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ success: false });
    }

    let payment = await Payments.findOne({
      where: {
        [Op.or]: [
          { reference: ExternalReference },
          { checkoutRequestId: CheckoutRequestID },
        ],
      },
    });

    let paymentStatus = Status;

    if (!paymentStatus) {
      paymentStatus = ResultCode === 0 ? "Paid" : "Failed";
    }

    if (MpesaReceiptNumber) {
      paymentStatus = "Paid";
    }

    if (payment) {
      await payment.update({
        amount: Amount || payment.amount,
        phoneNumber: Phone || payment.phoneNumber,
        status: paymentStatus,
        mpesaReceiptNumber: MpesaReceiptNumber,
      });
    } else {
      payment = await Payments.create({
        amount: Amount,
        phoneNumber: Phone,
        status: paymentStatus,
        reference: ExternalReference,
        checkoutRequestId: CheckoutRequestID,
        mpesaReceiptNumber: MpesaReceiptNumber,
        userId,
        orderId,
        isApproved: false,
      });
    }

    if (paymentStatus === "Paid") {
      await order.update({
        paymentStatus: "Paid",
        orderStatus: "Processing",
      });
    } else if (paymentStatus === "Cancelled" || paymentStatus === "Failed") {
      await order.update({
        paymentStatus: "Cancelled",
        orderStatus: "Cancelled",
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Callback Error:", error.message);
    return res.status(500).json({ success: false });
  }
};


// ✅ Get Latest Paid Payment for a User
const getLatestPaidPayment = async (req, res) => {
  try {
    const userId = req.user.id;

    const payment = await Payments.findOne({
      where: {
        userId,
        status: "Paid",
      },
      order: [["createdAt", "DESC"]],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "No successful payment found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Payment fetch error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Admin: Get All Payment History
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payments.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const approvePayments = async (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    const { isApproved } = req.body;
    const payment = await Payments.findOne({
      where: {
        id: paymentId,
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "payment not found.",
      });
    }

    await Payments.update({ isApproved }, { where: { id: paymentId } });

    res.status(200).json({success: true, message: "Payment approval status updated successfully."});
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Payment Status by Checkout Request ID
const getPaymentStatusByCheckoutRequestId = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;
    const payment = await Payments.findOne({
      where: { checkoutRequestId },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get Payment Status by Order ID
const getPaymentStatusByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await Payments.findOne({
      where: { orderId },
      order: [['createdAt', 'DESC']],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found for this order.',
      });
    }

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  initiatePayheroSTKPush,
  handleCallback,
  getLatestPaidPayment,
  getPaymentHistory,
  approvePayments,
  getPaymentStatusByCheckoutRequestId,
  getPaymentStatusByOrderId
};