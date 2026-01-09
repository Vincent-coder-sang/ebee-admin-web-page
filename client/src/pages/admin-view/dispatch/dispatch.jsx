/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getDispatches,
  createDispatch,
  updateDispatch,
  deleteDispatch,
} from "@/features/slices/dispatchSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Plus,
  RefreshCw,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Truck,
  Package,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";

const AdminDispatch = () => {
  const dispatch = useDispatch();
  const { list: dispatchList = [], status } = useSelector(
    (state) => state.dispatches
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);
  const [formData, setFormData] = useState({
    orderId: "",
    driverId: "",
    deliveryDate: "",
    estimatedDeliveryTime: "",
    deliveryAddress: "",
    status: "pending",
    notes: "",
    vehicleNumber: "",
    driverPhone: "",
  });

  useEffect(() => {
    dispatch(getDispatches());
  }, [dispatch]);

  // Filter dispatches
  const filteredDispatches = dispatchList.filter((dispatchItem) => {
    if (!searchTerm.trim()) {
      if (filterStatus === "all") return true;
      return dispatchItem.status === filterStatus;
    }

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      dispatchItem.order?.id?.toString().includes(searchLower) ||
      dispatchItem.driver?.name?.toLowerCase().includes(searchLower) ||
      dispatchItem.driver?.email?.toLowerCase().includes(searchLower) ||
      dispatchItem.deliveryAddress?.toLowerCase().includes(searchLower) ||
      dispatchItem.vehicleNumber?.toLowerCase().includes(searchLower);

    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && dispatchItem.status === filterStatus;
  });

  const handleAddDispatch = () => {
    setSelectedDispatch(null);
    setFormData({
      orderId: "",
      driverId: "",
      deliveryDate: "",
      estimatedDeliveryTime: "",
      deliveryAddress: "",
      status: "pending",
      notes: "",
      vehicleNumber: "",
      driverPhone: "",
    });
    setShowAddDialog(true);
  };

  const handleEditDispatch = (dispatchItem) => {
    setSelectedDispatch(dispatchItem);
    setFormData({
      orderId: dispatchItem.order?.id || "",
      driverId: dispatchItem.driver?.id || "",
      deliveryDate: dispatchItem.deliveryDate
        ? format(new Date(dispatchItem.deliveryDate), "yyyy-MM-dd")
        : "",
      estimatedDeliveryTime: dispatchItem.estimatedDeliveryTime || "",
      deliveryAddress: dispatchItem.deliveryAddress || "",
      status: dispatchItem.status || "pending",
      notes: dispatchItem.notes || "",
      vehicleNumber: dispatchItem.vehicleNumber || "",
      driverPhone: dispatchItem.driverPhone || "",
    });
    setShowAddDialog(true);
  };

  const handleDeleteDispatch = (dispatchItem) => {
    setSelectedDispatch(dispatchItem);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedDispatch) {
      dispatch(deleteDispatch(selectedDispatch.id)).then(() => {
        setShowDeleteDialog(false);
        setSelectedDispatch(null);
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.orderId || !formData.driverId || !formData.deliveryDate) {
      alert("Please fill in required fields: Order ID, Driver ID, and Delivery Date");
      return;
    }

    const dispatchData = {
      ...formData,
      deliveryDate: new Date(formData.deliveryDate).toISOString(),
    };

    if (selectedDispatch) {
      dispatch(
        updateDispatch({
          dispatchId: selectedDispatch.id,
          dispatchData: dispatchData,
        })
      ).then(() => {
        setShowAddDialog(false);
        setSelectedDispatch(null);
      });
    } else {
      dispatch(createDispatch(dispatchData)).then(() => {
        setShowAddDialog(false);
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "assigned":
        return (
          <Badge className="bg-blue-100 text-blue-800 gap-1">
            <User className="h-3 w-3" />
            Assigned
          </Badge>
        );
      case "in_transit":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 gap-1">
            <Truck className="h-3 w-3" />
            In Transit
          </Badge>
        );
      case "delivered":
        return (
          <Badge className="bg-green-100 text-green-800 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Cancelled
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 gap-1">
            <AlertTriangle className="h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusCount = (status) => {
    return dispatchList.filter((item) => item.status === status).length;
  };

  if (status === "pending" && dispatchList.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="w-full h-16 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Add/Edit Dispatch Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {selectedDispatch ? "Edit Dispatch" : "Create New Dispatch"}
            </DialogTitle>
            <DialogDescription>
              {selectedDispatch
                ? "Update the dispatch details below."
                : "Fill in the details to create a new dispatch record."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderId">Order ID *</Label>
                  <Input
                    id="orderId"
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleInputChange}
                    placeholder="Enter order ID"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driverId">Driver ID *</Label>
                  <Input
                    id="driverId"
                    name="driverId"
                    value={formData.driverId}
                    onChange={handleInputChange}
                    placeholder="Enter driver ID"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Delivery Date *</Label>
                  <Input
                    id="deliveryDate"
                    name="deliveryDate"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedDeliveryTime">
                    Estimated Delivery Time
                  </Label>
                  <Input
                    id="estimatedDeliveryTime"
                    name="estimatedDeliveryTime"
                    value={formData.estimatedDeliveryTime}
                    onChange={handleInputChange}
                    placeholder="e.g., 14:00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">Delivery Address</Label>
                <Textarea
                  id="deliveryAddress"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleInputChange}
                  placeholder="Enter complete delivery address"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                  <Input
                    id="vehicleNumber"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., KAA 123A"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driverPhone">Driver Phone</Label>
                  <Input
                    id="driverPhone"
                    name="driverPhone"
                    value={formData.driverPhone}
                    onChange={handleInputChange}
                    placeholder="e.g., 0712 345 678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes or instructions"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={status === "pending"}>
                {status === "pending"
                  ? "Saving..."
                  : selectedDispatch
                  ? "Update"
                  : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this dispatch record? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedDispatch && (
            <div className="py-4">
              <div className="font-medium">
                Dispatch #{selectedDispatch.id}
              </div>
              <div className="text-sm text-gray-500">
                Order: #{selectedDispatch.order?.id}
              </div>
              <div className="text-sm text-gray-500">
                Driver: {selectedDispatch.driver?.name || "N/A"}
              </div>
              <div className="text-sm text-gray-500">
                Status: {selectedDispatch.status}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dispatch Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage order deliveries and driver assignments
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Dispatches
                </CardTitle>
                <Truck className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dispatchList.length}</div>
                <p className="text-xs text-gray-500">All dispatch records</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getStatusCount("pending")}
                </div>
                <p className="text-xs text-gray-500">Awaiting assignment</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Transit</CardTitle>
                <Package className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getStatusCount("in_transit")}
                </div>
                <p className="text-xs text-gray-500">Currently delivering</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getStatusCount("delivered")}
                </div>
                <p className="text-xs text-gray-500">Successfully delivered</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, driver, address..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => dispatch(getDispatches())}
                disabled={status === "pending"}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>

              <Button onClick={handleAddDispatch}>
                <Plus className="mr-2 h-4 w-4" />
                New Dispatch
              </Button>
            </div>
          </div>
        </div>

        {/* Dispatch Table */}
        <Card>
          <CardHeader className="border-b p-4">
            <CardTitle className="text-lg">Dispatch Records</CardTitle>
            <CardDescription>
              Track and manage all order deliveries
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispatch ID</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Delivery Address</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDispatches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Truck className="w-12 h-12 text-muted-foreground" />
                        <div>
                          <h3 className="text-lg font-medium">
                            No dispatch records found
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {searchTerm || filterStatus !== "all"
                              ? "Try adjusting your search or filter criteria"
                              : "Create your first dispatch by clicking 'New Dispatch'"}
                          </p>
                        </div>
                        <Button variant="outline" onClick={handleAddDispatch}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Dispatch
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDispatches.map((dispatchItem) => (
                    <TableRow key={dispatchItem.id}>
                      <TableCell className="font-mono text-sm">
                        #{dispatchItem.id}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          Order #{dispatchItem.order?.id}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Status: {dispatchItem.order?.orderStatus}
                        </div>
                      </TableCell>
                      <TableCell>
                        {dispatchItem.driver ? (
                          <div>
                            <div className="font-medium">
                              {dispatchItem.driver.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {dispatchItem.driver.email}
                            </div>
                            {dispatchItem.driverPhone && (
                              <div className="text-xs text-muted-foreground">
                                <Phone className="inline h-3 w-3 mr-1" />
                                {dispatchItem.driverPhone}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">
                            Not assigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">
                          {dispatchItem.deliveryAddress || "N/A"}
                        </div>
                        {dispatchItem.vehicleNumber && (
                          <div className="text-xs text-muted-foreground">
                            <Truck className="inline h-3 w-3 mr-1" />
                            {dispatchItem.vehicleNumber}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {dispatchItem.deliveryDate
                            ? formatDate(dispatchItem.deliveryDate)
                            : "N/A"}
                        </div>
                        {dispatchItem.estimatedDeliveryTime && (
                          <div className="text-xs text-muted-foreground">
                            Est: {dispatchItem.estimatedDeliveryTime}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(dispatchItem.status)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditDispatch(dispatchItem)}
                            disabled={status === "pending"}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteDispatch(dispatchItem)}
                            disabled={status === "pending"}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div>
            Showing {filteredDispatches.length} of {dispatchList.length} records
          </div>
          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => {
                // Export functionality
                console.log("Export dispatch data");
              }}
            >
              Export Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDispatch;