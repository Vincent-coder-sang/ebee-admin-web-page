/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "@/features/slices/orderSlice";

// // Sample data (replace with real data from an API or state)
// const sampleOrders = [
//   { id: 1, customer: "John Doe", product: "Laptop", status: "Pending", total: "$1200", date: "2024-11-10" },
//   { id: 2, customer: "Jane Smith", product: "Smartphone", status: "Completed", total: "$800", date: "2024-11-09" },
//   { id: 3, customer: "Michael Brown", product: "Headphones", status: "Shipped", total: "$150", date: "2024-11-08" },
//   { id: 4, customer: "Sarah White", product: "Monitor", status: "Cancelled", total: "$350", date: "2024-11-07" },
//   // Add more sample data as needed
// ];

const AdminOrdersView = () => {
  // const [orders, setOrders] = useState([]);

  const dispatch = useDispatch();

  const {list : orders, status} = useSelector((state) => state.orders);

  console.log("oders.........", orders);

  useEffect(() => {
    // setOrders(sampleOrders); // Replace with API call for real data
    dispatch(fetchOrders());
  }, [dispatch]);

  if (!orders.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        No orders found.
      </div>
    );
  }
  if(status === "rejected") {
    return <div className="flex items-center justify-center min-h-screen">Failed to load orders</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Orders</h1>
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        {/* Scrollable container with a fixed height */}
        <div className="overflow-y-auto max-h-96">
          <Table className="min-w-full text-left">
            <TableCaption>List of recent orders</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-b">
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.product}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === "Completed"
                          ? "bg-green-100 text-green-600"
                          : order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-600"
                          : order.status === "Shipped"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>{order.total}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => console.log(`Viewing order ${order.id}`)}
                    >
                      View
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersView;
