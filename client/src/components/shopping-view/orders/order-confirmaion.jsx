import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const lastOrder = useSelector((state) => state.orders.lastOrder); // Assuming last order is stored in Redux

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 text-center max-w-md">
        <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Order Placed Successfully!</h2>
        <p className="text-lg font-semibold">Order ID: {lastOrder?.id}</p>
        <p className="text-gray-600 mt-2">Total: KSH {lastOrder?.total}</p>
        <p className="text-gray-600">Payment Method: {lastOrder?.paymentMethod}</p>

        <div className="mt-6 flex flex-col gap-4">
          <button 
            className="bg-blue-500 text-white py-2 px-4 rounded-lg w-full"
            onClick={() => navigate("/orders")}
          >
            📦 Track Your Order
          </button>

          <button 
            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg w-full"
            onClick={() => navigate("/home")}
          >
            🛍️ Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
