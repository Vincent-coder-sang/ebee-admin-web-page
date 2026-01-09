/* eslint-disable no-unused-vars */
import { fetchOrders, updateOrder } from "@/features/slices/orderSlice";
import { useEffect, useState } from "react";
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
import { 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  User, 
  RefreshCw, 
  Eye, 
  Package,
  Search,
  ChevronDown,
  Filter,
  Calendar,
  DollarSign,
  ShoppingBag
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import PropTypes from 'prop-types'; // Add this import

const AdminOrders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: orders, status } = useSelector((state) => state.orders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Filter orders based on search term and filters
  const filteredOrders = orders?.filter(order => {
    if (!searchTerm.trim() && statusFilter === "all") return true;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm.trim() === "" || (
      order.id?.toString().includes(searchLower) ||
      order.user?.name?.toLowerCase().includes(searchLower) ||
      order.user?.email?.toLowerCase().includes(searchLower) ||
      order.orderStatus?.toLowerCase().includes(searchLower) ||
      order.paymentStatus?.toLowerCase().includes(searchLower)
    );
    
    const matchesStatus = statusFilter === "all" || 
                         order.orderStatus?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status) => {
    if (!status) return <Badge variant="outline" className="px-2 py-0.5 text-xs">Unknown</Badge>;
    
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge variant="secondary" className="px-2 py-0.5 text-xs bg-yellow-50 text-yellow-800 border-yellow-200">Pending</Badge>;
      case "processing":
        return <Badge className="bg-blue-50 text-blue-800 border-blue-200 px-2 py-0.5 text-xs">Processing</Badge>;
      case "completed":
        return <Badge className="bg-green-50 text-green-800 border-green-200 px-2 py-0.5 text-xs">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="px-2 py-0.5 text-xs">Cancelled</Badge>;
      case "paid":
        return <Badge className="bg-purple-50 text-purple-800 border-purple-200 px-2 py-0.5 text-xs">Paid</Badge>;
      case "shipped":
        return <Badge className="bg-indigo-50 text-indigo-800 border-indigo-200 px-2 py-0.5 text-xs">Shipped</Badge>;
      case "delivered":
        return <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 px-2 py-0.5 text-xs">Delivered</Badge>;
      default:
        return <Badge variant="outline" className="px-2 py-0.5 text-xs">{status}</Badge>;
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrder({ 
        orderId, 
        values: { orderStatus: newStatus } 
      })).unwrap();
      dispatch(fetchOrders());
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const calculateTotalItems = (orderItems) => {
    return orderItems?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;
  };

  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // Define OrderCardMobile component with PropTypes
  const OrderCardMobile = ({ order }) => {
    const totalItems = calculateTotalItems(order.orderItems);
    const totalPrice = order.totalPrice || 0;
    const createdAt = order.createdAt ? format(new Date(order.createdAt), "MMM dd, yyyy") : "N/A";
    const orderId = order.id?.toString().slice(-6);
    
    return (
      <Card className="mb-3">
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm sm:text-base">
                  Order #{orderId}
                </h3>
                <p className="text-xs text-gray-500">
                  {createdAt}
                </p>
              </div>
              <div className="flex gap-1">
                {getStatusBadge(order.orderStatus)}
                {getStatusBadge(order.paymentStatus)}
              </div>
            </div>

            {/* Customer Info */}
            {order.user && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-3.5 w-3.5 text-gray-400" />
                <div>
                  <p className="font-medium">{order.user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{order.user.email}</p>
                </div>
              </div>
            )}

            {/* Order Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-3.5 w-3.5 text-gray-400" />
                <span>{totalItems} items</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                <span className="font-medium">
                  KES {totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs h-8"
                onClick={() => handleViewOrder(order.id)}
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                View
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs h-8">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
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
          </div>
        </CardContent>
      </Card>
    );
  };

  // Add PropTypes for OrderCardMobile
  OrderCardMobile.propTypes = {
    order: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      createdAt: PropTypes.string,
      orderStatus: PropTypes.string,
      paymentStatus: PropTypes.string,
      totalPrice: PropTypes.number,
      orderItems: PropTypes.array,
      user: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
      }),
    }).isRequired,
  };

  if (status === "pending" && orders.length === 0) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <Skeleton className="h-8 sm:h-10 w-48 sm:w-64 mb-4 sm:mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-5 sm:h-6 w-36 sm:w-48" />
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Skeleton className="h-3.5 sm:h-4 w-24 sm:w-32" />
                    <Skeleton className="h-3 sm:h-3 w-20 sm:w-24" />
                  </div>
                  <Skeleton className="h-7 sm:h-8 w-20 sm:w-24" />
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
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl font-semibold text-red-600">
              Failed to load orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => dispatch(fetchOrders())}
              className="gap-2 w-full sm:w-auto"
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
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Order Management</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {filteredOrders.length}{" "}
              {filteredOrders.length === 1 ? "order" : "orders"} found
            </p>
          </div>

          {/* Tabs for Mobile */}
          <div className="block sm:hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
                <TabsTrigger value="processing" className="text-xs">Processing</TabsTrigger>
                <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-0"></TabsContent>
            </Tabs>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-9 sm:pl-10 text-sm h-9 sm:h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Mobile Filter Button */}
            <div className="flex gap-2 sm:hidden">
              <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Filter className="h-3.5 w-3.5 mr-1" />
                    Filter
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-auto">
                  <SheetHeader>
                    <SheetTitle className="text-lg">Filter Orders</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => setShowMobileFilters(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => dispatch(fetchOrders())}
                disabled={status === "pending"}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            {/* Desktop Filter and Refresh */}
            <div className="hidden sm:flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={() => dispatch(fetchOrders())}
                disabled={status === "pending"}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Order Cards */}
        <div className="block sm:hidden">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                <Package className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground mb-2 sm:mb-4" />
                <div>
                  <h3 className="text-base font-medium">No orders found</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search criteria"
                      : "There are currently no orders"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div>
              {filteredOrders.map((order) => (
                <OrderCardMobile key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>

        {/* Desktop Orders Table */}
        <div className="hidden sm:block">
          <Card>
            <CardHeader className="border-b p-4">
              <CardTitle className="text-lg">All Orders</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px] text-xs sm:text-sm">Order ID</TableHead>
                    <TableHead className="text-xs sm:text-sm">Customer</TableHead>
                    <TableHead className="text-xs sm:text-sm">Date</TableHead>
                    <TableHead className="text-xs sm:text-sm">Items</TableHead>
                    <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-xs sm:text-sm">Payment</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
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
                              {searchTerm || statusFilter !== "all"
                                ? "Try adjusting your search criteria"
                                : "There are currently no orders"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-xs sm:text-sm">
                          #{order.id?.toString().slice(-6)}
                        </TableCell>
                        <TableCell>
                          {order.user ? (
                            <div>
                              <div className="font-medium text-sm">{order.user.name}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {order.user.email}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic text-sm">
                              User #{order.userId}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {order.createdAt 
                            ? format(new Date(order.createdAt), "MMM dd")
                            : "N/A"
                          }
                        </TableCell>
                        <TableCell className="text-sm">
                          {calculateTotalItems(order.orderItems)} items
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          KES {(order.totalPrice || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
                        <TableCell>{getStatusBadge(order.paymentStatus)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewOrder(order.id)}
                              title="View Details"
                              className="h-8 w-8"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
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

        {/* Mobile Stats */}
        <div className="block sm:hidden">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Order Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600">Total Orders</p>
                  <p className="text-lg font-bold">{orders.length}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-600">Completed</p>
                  <p className="text-lg font-bold">
                    {orders.filter(o => o.orderStatus === 'completed').length}
                  </p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-xs text-yellow-600">Pending</p>
                  <p className="text-lg font-bold">
                    {orders.filter(o => o.orderStatus === 'pending').length}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-purple-600">Total Revenue</p>
                  <p className="text-lg font-bold">
                    KES {orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;