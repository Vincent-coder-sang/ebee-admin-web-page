/** @format */
const {
  Orders,
  Payments,
  OrderItems,
  Products,
  Carts,
  CartItems,
  sequelize,
} = require("../models");

const createOrderFromCart = async (req, res) => {
  const { cartId, userAddressId } = req.body;
  const userId = req.user.id;
  let transaction;

  try {
    transaction = await sequelize.transaction();

    // 🛒 Fetch cart with items
    const cart = await Carts.findOne({
      where: { id: cartId, userId },
      include: [
        {
          model: CartItems,
          as: "cartitems",
          include: ["product"],
        },
      ],
      transaction,
    });

    if (!cart || cart.cartitems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty or not found.",
      });
    }

    // 💰 Compute total & prepare order items
    let totalPrice = 0;
    const orderItems = [];

    for (const item of cart.cartitems) {
      if (!item.product) {
        throw new Error("Product not found in cart item.");
      }

      totalPrice += item.quantity * item.product.price;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      });
    }

    // 🧾 Create order (DO NOT touch cart)
    const newOrder = await Orders.create(
      {
        userId,
        cartId,
        userAddressId,
        totalPrice,
        orderStatus: "Pending",
        paymentStatus: "Pending",
      },
      { transaction }
    );

    // 📦 Create order items
    await OrderItems.bulkCreate(
      orderItems.map((item) => ({
        ...item,
        orderId: newOrder.id,
      })),
      { transaction }
    );

    // ❌ DO NOT clear cart here
    // Cart will be cleared ONLY after payment success

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Order created successfully.",
      order: newOrder,
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }

    console.error("❌ Order creation error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create order.",
    });
  }
};

// ============================================================================
// باقي الملفات بدون تغيير
// ============================================================================

// ✅ Get All Orders (admin)
const getOrders = async (req, res) => {
  try {
    const orders = await Orders.findAll({
      include: [
        {
          model: OrderItems,
          as: "orderItems",
          include: [
            {
              model: Products,
              as: "product",
              attributes: [
                "id",
                "name",
                "category",
                "description",
                "price",
                "imageUrl",
                "stockQuantity",
              ],
            },
          ],
        },
      ],
    });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Single Order
const getOrder = async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const order = await Orders.findByPk(orderId, {
      include: [
        {
          model: OrderItems,
          as: "orderItems",
          include: [
            {
              model: Products,
              as: "product",
              attributes: [
                "id",
                "name",
                "category",
                "description",
                "price",
                "imageUrl",
                "stockQuantity",
              ],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${orderId} not found.`,
      });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get My Orders
const getMyOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    const orders = await Orders.findAll({
      where: { userId },
      include: [
        {
          model: OrderItems,
          as: "orderItems",
          include: [
            {
              model: Products,
              as: "product",
              attributes: [
                "id",
                "name",
                "category",
                "description",
                "price",
                "imageUrl",
                "stockQuantity",
              ],
            },
          ],
        },
      ],
    });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Order
const updateOrders = async (req, res) => {
  const orderId = req.params.orderId;
  const { totalPrice, orderStatus, paymentStatus, userAddressId } = req.body;

  try {
    const order = await Orders.findByPk(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    await order.update({
      totalPrice,
      orderStatus,
      paymentStatus,
      userAddressId,
    });

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
    });
  } catch (error) {
    console.error("❌ Update error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete Order
const deleteOrders = async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const order = await Orders.findOne({ where: { id: orderId } });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${orderId} not found.`,
      });
    }

    await Orders.destroy({ where: { id: orderId } });

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrderFromCart,
  getOrders,
  getOrder,
  getMyOrders,
  updateOrders,
  deleteOrders,
};
