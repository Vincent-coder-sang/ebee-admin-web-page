import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { createOrder } from "@/features/slices/orderSlice";

const PaymentPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const cartItems = useSelector((state) => state.cart?.list || []);
  const userId = useSelector((state) => state.auth?.id);

  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: "",
    phoneNumber: "",
    streetAddress: "",
    city: "",
  });

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.quantity * item.product.price,
    0
  );

  // Handle input changes
  const handleInputChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  // Handle payment
  const handlePayment = async () => {
    if (!address.fullName || !address.phoneNumber || !address.streetAddress || !address.city) {
      toast.error("Please fill in all address details.");
      return;
    }

    setLoading(true);

    const orderData = {
      userId,
      items: cartItems,
      total: totalPrice,
      paymentMethod,
      address,
    };

    try {
      await dispatch(createOrder(orderData)).unwrap();
      toast.success("Order placed successfully!");
      navigate("/order-confirmation");
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100 flex flex-col items-center">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Checkout</h2>

        {/* Address Form */}
        <h3 className="text-lg font-semibold">Shipping Address</h3>
        <input name="fullName" placeholder="Full Name" value={address.fullName} onChange={handleInputChange} className="w-full p-2 border rounded mt-2" />
        <input name="phoneNumber" placeholder="Phone Number" value={address.phoneNumber} onChange={handleInputChange} className="w-full p-2 border rounded mt-2" />
        <input name="streetAddress" placeholder="Street Address" value={address.streetAddress} onChange={handleInputChange} className="w-full p-2 border rounded mt-2" />
        <input name="city" placeholder="City" value={address.city} onChange={handleInputChange} className="w-full p-2 border rounded mt-2 mb-4" />

        {/* Order Summary */}
        <h3 className="text-lg font-semibold">Order Summary</h3>
        <ul className="mb-4">
          {cartItems.map((item) => (
            <li key={item.id} className="flex justify-between py-2 border-b">
              <span>{item.product.name} (x{item.quantity})</span>
              <span>KSH {item.quantity * item.product.price}</span>
            </li>
          ))}
        </ul>
        <h3 className="text-xl font-bold">Total: KSH {totalPrice.toFixed(2)}</h3>

        {/* Payment Method */}
        <h3 className="text-lg font-semibold mt-6">Select Payment Method</h3>
        <label className="flex items-center gap-2 cursor-pointer mt-2">
          <input type="radio" value="mpesa" checked={paymentMethod === "mpesa"} onChange={() => setPaymentMethod("mpesa")} />
          M-Pesa
        </label>

        <button 
          className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded-lg"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? "Processing..." : "Place Order"}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
