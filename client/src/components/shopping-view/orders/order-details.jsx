import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchOrder} from "@/features/slices/orderSlice";

const OrderDetailsPage = () => {
  const { id } = useParams(); // Get order ID from URL
  const dispatch = useDispatch();
  const order = useSelector((state) => state.orders.selectedOrder);
  const loading = useSelector((state) => state.orders.loading);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrder(id)); // Fetch order details from API
    }
  }, [dispatch, id]);

  if (loading) return <p>Loading order details...</p>;
  if (!order) return <p>Order not found.</p>;

  return (
    <div className="p-8 min-h-screen bg-gray-100 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">📦 Order Details</h2>
        <p className="text-gray-600">Order ID: {order.id}</p>
        <p className="text-gray-600">Total: KSH {order.total}</p>
        <p className="text-gray-600">Status: {order.status}</p>
        <p className="text-gray-600">Payment Method: {order.paymentMethod}</p>

        <h3 className="text-lg font-semibold mt-4">🛒 Items Ordered</h3>
        <ul>
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2 border-b">
              <span>{item.product.name} (x{item.quantity})</span>
              <span>KSH {item.quantity * item.product.price}</span>
            </li>
          ))}
        </ul>

        <h3 className="text-lg font-semibold mt-4">📍 Shipping Address</h3>
        <p>{order.address.fullName}</p>
        <p>{order.address.phoneNumber}</p>
        <p>{order.address.streetAddress}, {order.address.city}</p>

        <h3 className="text-lg font-semibold mt-4">🚚 Tracking</h3>
        <p className="text-gray-600">{order.tracking ? order.tracking : "Tracking info not available."}</p>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
