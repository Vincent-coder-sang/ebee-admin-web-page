import { fetchOrders, updateOrder } from "@/features/slices/orderSlice";
import { useEffect } from "react";
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
import { MoreVertical, CheckCircle2, XCircle, Truck, User, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { list: orders, status } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
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
      default:
        return <Badge variant="outline" className="px-2 py-1 text-xs">Unknown</Badge>;
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrder({ orderId, status: newStatus })).unwrap();
      dispatch(fetchOrders());
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const calculateTotalItems = (orderItems) => {
    return orderItems?.reduce((total, item) => total + item.quantity, 0) || 0;
  };

  if (status === "pending") {
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search orders..."
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Recent Orders</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => dispatch(fetchOrders())}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[120px]">Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="w-[50px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.length > 0 ? (
                    orders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">User #{order.userId}</span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(order.createdAt), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          {calculateTotalItems(order.orderItems)} items
                        </TableCell>
                        <TableCell className="font-medium">
                          Ksh {order.totalPrice.toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
                        <TableCell>{getStatusBadge(order.paymentStatus)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(order.id, "processing")}
                                className="cursor-pointer"
                              >
                                <Truck className="mr-2 h-4 w-4 text-blue-500" />
                                <span>Processing</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(order.id, "completed")}
                                className="cursor-pointer"
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                <span>Completed</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(order.id, "cancelled")}
                                className="cursor-pointer text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                <span>Cancel</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <User className="h-8 w-8 text-gray-400" />
                          <p className="text-gray-500">No orders found</p>
                          <Button 
                            variant="outline"
                            onClick={() => dispatch(fetchOrders())}
                          >
                            Refresh
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {orders?.length > 0 && (
          <div className="text-sm text-gray-500 text-center">
            Showing {orders.length} {orders.length === 1 ? "order" : "orders"}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;