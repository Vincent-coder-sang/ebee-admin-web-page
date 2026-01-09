import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "@/features/slices/orderSlice";
import { useNavigate } from "react-router-dom";

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orders = useSelector((state) => state.orders.list || []);
  const loading = useSelector((state) => state.orders.loading);
  const userId = useSelector((state) => state.auth?.id);

  useEffect(() => {
    if (userId) {
      dispatch(fetchOrders(userId)); // Fetch user's orders from API
    }
  }, [dispatch, userId]);

  return (
    <div className="p-8 min-h-screen bg-gray-100 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">📦 My Orders</h2>

      {loading && <p>Loading orders...</p>}
      {!loading && orders.length === 0 && <p>No orders found.</p>}

      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6">
        {orders.map((order) => (
          <div key={order.id} className="p-4 border-b">
            <h3 className="text-lg font-semibold">Order ID: {order.id}</h3>
            <p className="text-gray-600">Total: KSH {order.total}</p>
            <p className="text-gray-600">Status: {order.status}</p>
            <button 
              className="mt-2 bg-blue-500 text-white py-1 px-3 rounded"
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              📍 Track Order
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
