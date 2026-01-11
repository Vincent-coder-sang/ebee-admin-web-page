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

// ✅ STK Push Payment Initiation
const initiatePayheroSTKPush = async (req, res) => {
  try {
    const { phone, amount, orderId } = req.body;
    const userId = req.user.id;

    // Validate request fields
    if (!phone || !amount || !userId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Phone, amount, userId, and orderId are required.",
      });
    }

    const formattedPhone = phone.startsWith("0")
      ? `254${phone.slice(1)}`
      : phone;

    const reference = `PAY-${userId}-${Date.now()}-${orderId}`;

    // Check for existing pending payments for this order
    const existingPayment = await Payments.findOne({
      where: {
        orderId,
        [Op.or]: [
          { status: "Pending" },
          { status: "QUEUED" },
          { status: null }
        ]
      },
    });

    if (existingPayment) {
      console.log('⚠️ Existing payment found:', existingPayment.id);
      return res.status(400).json({
        success: false,
        message: "A payment already exists for this order. Please wait for it to complete.",
        existingPaymentId: existingPayment.id
      });
    }

    // Send STK push
    const response = await axios.post(
      "https://backend.payhero.co.ke/api/v2/payments",
      {
        amount: parseInt(amount),
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

    console.log(
      "📱 Payhero Raw Response:",
      JSON.stringify(response.data, null, 2)
    );

    const paymentData = response.data;

    if (!paymentData?.CheckoutRequestID) {
      console.error("❌ Invalid payment response:", paymentData);
      return res.status(500).json({
        success: false,
        message: "Failed to initiate payment. Please try again.",
        data: paymentData,
      });
    }

    // Create payment record
    const payment = await Payments.create({
      amount,
      phoneNumber: formattedPhone,
      status: "QUEUED",
      reference: reference,
      checkoutRequestId: paymentData.CheckoutRequestID,
      isApproved: false,
      userId,
      orderId,
    });

    console.log('✅ Payment record created:', payment.id);

    return res.status(200).json({
      success: true,
      message: "STK Push sent. Check your phone.",
      data: paymentData,
      paymentId: payment.id
    });
  } catch (error) {
    console.error("❌ STK Error:", error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Payment Callback Handler - FIXED TO MATCH MODELS
const handleCallback = async (req, res) => {
  try {
    const callbackData = req.body;
    console.log('📱 PayHero Callback Received:', JSON.stringify(callbackData, null, 2));

    if (!callbackData.response) {
      return res.status(400).json({
        success: false,
        message: "Invalid callback data.",
      });
    }

    const {
      Amount: amount,
      Phone: phoneNumber,
      Status: status,
      MpesaReceiptNumber: mpesaReceiptNumber,
      CheckoutRequestID: checkoutRequestId,
      ExternalReference: reference,
      ResultCode: resultCode,
      ResultDesc: resultDesc,
    } = callbackData.response;

    console.log('🔍 Callback Details:', {
      reference,
      checkoutRequestId,
      status,
      mpesaReceiptNumber,
      resultCode,
      resultDesc
    });

    // Extract userId and orderId from reference (format: PAY-{userId}-{timestamp}-{orderId})
    const parts = reference.split("-");
    if (parts.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Invalid reference format.",
      });
    }

    const userId = parts[1];
    const orderId = parts[3];

    console.log('👤 Extracted IDs:', { userId, orderId });

    // Find user and order
    const user = await Users.findByPk(userId);
    const order = await Orders.findByPk(orderId);

    if (!user || !order) {
      console.error('❌ User or Order not found:', { userId, orderId });
      return res.status(404).json({
        success: false,
        message: "User or Order not found.",
      });
    }

    // Find payment by reference OR checkoutRequestId
    let payment = await Payments.findOne({
      where: {
        [Op.or]: [
          { reference: reference },
          { checkoutRequestId: checkoutRequestId }
        ]
      }
    });

    console.log('💰 Found Payment:', payment ? payment.id : 'Not found');

    // Determine payment status based on Pay Hero response
    let paymentStatus = status;
    
    // If Pay Hero doesn't send status, determine from resultCode
    if (!paymentStatus) {
      if (resultCode === 0) {
        paymentStatus = "Paid";
      } else if (resultCode === 1) {
        paymentStatus = "Failed";
      } else if (resultCode === 1032) {
        paymentStatus = "Cancelled";
      } else {
        paymentStatus = "Failed";
      }
    }

    // If we have mpesaReceiptNumber, payment is definitely successful
    if (mpesaReceiptNumber) {
      paymentStatus = "Paid";
    }

    console.log('🎯 Final Payment Status:', paymentStatus);

    if (payment) {
      // Update existing payment
      console.log('🔄 Updating existing payment:', payment.id);
      await payment.update({
        amount: amount || payment.amount,
        phoneNumber: phoneNumber || payment.phoneNumber,
        status: paymentStatus,
        mpesaReceiptNumber: mpesaReceiptNumber || payment.mpesaReceiptNumber,
        isApproved: false,
      });
    } else {
      // Create new payment only if not found
      console.log('⚠️ Creating new payment (unexpected)');
      payment = await Payments.create({
        amount: amount,
        phoneNumber: phoneNumber,
        status: paymentStatus,
        reference: reference,
        checkoutRequestId: checkoutRequestId,
        mpesaReceiptNumber: mpesaReceiptNumber,
        userId: userId,
        orderId: orderId,
        isApproved: false,//finance or admin will update this
      });
    }

    // ✅ Update order based on payment status - MATCHING MODEL ENUM
    if (paymentStatus === "Paid") {
      console.log('✅ Updating order paymentStatus to Paid and orderStatus to Processing');
      await order.update({
        paymentStatus: "Paid", // Matches Orders model ENUM
        orderStatus: "Processing", // Matches Orders model ENUM
      });
    } else if (paymentStatus === "Pending" || paymentStatus === "Cancelled") {
      console.log('❌ Updating order paymentStatus to Cancelled and orderStatus to Cancelled');
      await order.update({
        paymentStatus: "Cancelled", // Matches Orders model ENUM
        orderStatus: "Cancelled", // Matches Orders model ENUM
      });
    }

    console.log('🎉 Payment processing completed successfully');

    return res.status(200).json({
      success: true,
      message: "Payment processed successfully.",
      data: payment,
    });
  } catch (error) {
    console.error("❌ Callback Error:", error.message);
    console.error("❌ Callback Error Stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
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