/** @format */
const { Carts, CartItems, Products } = require("../models");

const addProductToCart = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id

  try {
    const product = await Products.findByPk(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // 1️⃣ Check if user has a cart
    let cart = await Carts.findOne({ where: { userId } });

    // If no cart, create one
    if (!cart) {
      cart = await Carts.create({ userId });
    }

    let cartItem = await CartItems.findOne({
      where: { cartId: cart.id, productId },
    });

    if (cartItem) {
      // Increase quantity
      cartItem.quantity += 1;
      await cartItem.save();
    } else {
      // Add new item
      cartItem = await CartItems.create({
        cartId: cart.id,
        productId,
        quantity: 1,
      });
    }

    res.status(200).json({ success: true, data: cartItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Carts.findOne({
      where: { userId },
      include: [
        {
          model: CartItems,
          as: "cartitems",
          include: [
            {
              model: Products,
              as: "product",
              attributes: ["id", "name", "description", "price", "imageUrl", "category"],
            },
          ],
        },
      ],
    });

    if (!cart || !cart.cartitems || cart.cartitems.length === 0) {
       return res.status(404).json({ success: false, message: "Cart is empty" });
    }

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const increaseProductQuantity = async (req, res) => {
  try {
    const { cartItemId } = req.params;

    const cartItem = await CartItems.findByPk(cartItemId);

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    cartItem.quantity += 1;
    await cartItem.save();

    res.json({ success: true, message: "Quantity increased", data: cartItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const decreaseProductQuantity = async (req, res) => {
  try {
    const { cartItemId } = req.params;

    const cartItem = await CartItems.findByPk(cartItemId);

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      await cartItem.save();
      res.json({ success: true, message: "Quantity decreased", data: cartItem });
    } else {
      await cartItem.destroy();
      res.json({ success: true, message: "Item removed from cart" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeItemFromCart = async (req, res) => {
  try {
    const { cartItemId } = req.params;

    const cartItem = await CartItems.findByPk(cartItemId);

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    await cartItem.destroy();

    res.json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const clearCart = async (req, res) => {
  const userId = req.user.id;

  try {
    const cart = await Carts.findOne({ where: { userId } });

    // ✅ Cart already cleared → still success
    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart already empty.",
      });
    }

    await CartItems.destroy({ where: { cartId: cart.id } });
    await Carts.destroy({ where: { id: cart.id } });

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  addProductToCart,
  getCart,
  increaseProductQuantity,
  decreaseProductQuantity,
  removeItemFromCart,
  clearCart,
};
