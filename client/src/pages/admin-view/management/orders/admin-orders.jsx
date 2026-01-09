/* eslint-disable no-unused-vars */
import { fetchOrders, updateOrder } from "@/features/slices/orderSlice";
import { useEffect, useState } from "react"; // Added useState
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, CheckCircle2, XCircle, Truck, User, RefreshCw, Eye, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Added useNavigate

const AdminOrders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: orders, status } = useSelector((state) => state.orders);
  const [searchTerm, setSearchTerm] = useState(""); // Added search state

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Filter orders based on search term
  const filteredOrders = orders?.filter(order => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      order.id?.toString().includes(searchLower) ||
      order.user?.name?.toLowerCase().includes(searchLower) ||
      order.user?.email?.toLowerCase().includes(searchLower) ||
      order.orderStatus?.toLowerCase().includes(searchLower) ||
      order.paymentStatus?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const getStatusBadge = (status) => {
    if (!status) return <Badge variant="outline" className="px-2 py-1 text-xs">Unknown</Badge>;
    
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge variant="secondary" className="px-2 py-1 text-xs">Pending</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800 px-2 py-1 text-xs">Processing</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800 px-2 py-1 text-xs">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="px-2 py-1 text-xs">Cancelled</Badge>;
      case "paid":
        return <Badge className="bg-purple-100 text-purple-800 px-2 py-1 text-xs">Paid</Badge>;
      case "shipped":
        return <Badge className="bg-indigo-100 text-indigo-800 px-2 py-1 text-xs">Shipped</Badge>;
      case "delivered":
        return <Badge className="bg-emerald-100 text-emerald-800 px-2 py-1 text-xs">Delivered</Badge>;
      default:
        return <Badge variant="outline" className="px-2 py-1 text-xs">{status}</Badge>;
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrder({ 
        orderId, 
        values: { orderStatus: newStatus } 
      })).unwrap();
      dispatch(fetchOrders()); // Refresh the list
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const calculateTotalItems = (orderItems) => {
    return orderItems?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;
  };

  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`); // You might want to create an order details page
  };

  if (status === "pending" && orders.length === 0) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-red-600">
              Failed to load orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => dispatch(fetchOrders())}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold">Order Management</h1>
            <p className="text-sm text-muted-foreground">
              {filteredOrders.length}{" "}
              {filteredOrders.length === 1 ? "order" : "orders"} found
            </p>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders by ID, customer, status..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => dispatch(fetchOrders())}
                disabled={status === "pending"}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader className="border-b p-4">
            <CardTitle className="text-lg">All Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Package className="w-12 h-12 text-muted-foreground" />
                        <div>
                          <h3 className="text-lg font-medium">No orders found</h3>
                          <p className="text-muted-foreground text-sm">
                            {searchTerm
                              ? "Try adjusting your search criteria"
                              : "There are currently no orders"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        #{order.id}
                      </TableCell>
                      <TableCell>
                        {order.user ? (
                          <div>
                            <div className="font-medium">{order.user.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {order.user.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">
                            User #{order.userId}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {order.createdAt 
                          ? format(new Date(order.createdAt), "MMM dd, yyyy")
                          : "N/A"
                        }
                      </TableCell>
                      <TableCell>
                        {calculateTotalItems(order.orderItems)} items
                      </TableCell>
                      <TableCell className="font-medium">
                        KES {(order.totalPrice || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
                      <TableCell>{getStatusBadge(order.paymentStatus)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewOrder(order.id)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(order.id, "processing")}
                              >
                                <Truck className="mr-2 h-4 w-4" />
                                Mark as Processing
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(order.id, "completed")}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark as Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(order.id, "cancelled")}
                                className="text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOrders;