/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getInventoryLogs,
  createInventoryLogs,
  deleteInventoryLogs,
} from "@/features/slices/inventorySlice";
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
  Package,
  ArrowUpDown,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

const AdminInventory = () => {
  const dispatch = useDispatch();
  const { logs: inventoryItems = [], status } = useSelector(
    (state) => state.inventory
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    productCode: "",
    category: "",
    quantity: "",
    unitPrice: "",
    location: "",
    supplier: "",
    notes: "",
    actionType: "add", // add, remove, adjust
  });

  useEffect(() => {
    dispatch(getInventoryLogs());
  }, [dispatch]);

  // Filter and sort inventory items
  const filteredItems = inventoryItems
    .filter((item) => {
      if (!searchTerm.trim()) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        item.productName?.toLowerCase().includes(searchLower) ||
        item.productCode?.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower) ||
        item.location?.toLowerCase().includes(searchLower) ||
        item.supplier?.toLowerCase().includes(searchLower)
      );
    })
    .filter((item) => {
      if (filterType === "all") return true;
      if (filterType === "lowStock") return (item.quantity || 0) <= 10;
      if (filterType === "outOfStock") return (item.quantity || 0) === 0;
      return item.actionType === filterType;
    })
    .sort((a, b) => {
      if (sortBy === "quantity") {
        return sortOrder === "asc"
          ? (a.quantity || 0) - (b.quantity || 0)
          : (b.quantity || 0) - (a.quantity || 0);
      }
      if (sortBy === "unitPrice") {
        return sortOrder === "asc"
          ? (a.unitPrice || 0) - (b.unitPrice || 0)
          : (b.unitPrice || 0) - (a.unitPrice || 0);
      }
      if (sortBy === "createdAt") {
        return sortOrder === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

  const handleAddItem = () => {
    setSelectedItem(null);
    setFormData({
      productName: "",
      productCode: "",
      category: "",
      quantity: "",
      unitPrice: "",
      location: "",
      supplier: "",
      notes: "",
      actionType: "add",
    });
    setShowAddDialog(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setFormData({
      productName: item.productName || "",
      productCode: item.productCode || "",
      category: item.category || "",
      quantity: item.quantity?.toString() || "",
      unitPrice: item.unitPrice?.toString() || "",
      location: item.location || "",
      supplier: item.supplier || "",
      notes: item.notes || "",
      actionType: item.actionType || "add",
    });
    setShowAddDialog(true);
  };

  const handleDeleteItem = (item) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteInventoryLogs(selectedItem._id)).then(() => {
        setShowDeleteDialog(false);
        setSelectedItem(null);
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.productName || !formData.quantity || !formData.actionType) {
      alert("Please fill in required fields: Product Name, Quantity, and Action Type");
      return;
    }

    const inventoryData = {
      ...formData,
      quantity: parseInt(formData.quantity),
      unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : 0,
    };

    if (selectedItem) {
      // For update, we'd need an update endpoint
      console.log("Update functionality would go here");
    } else {
      dispatch(createInventoryLogs(inventoryData)).then(() => {
        setShowAddDialog(false);
        setFormData({
          productName: "",
          productCode: "",
          category: "",
          quantity: "",
          unitPrice: "",
          location: "",
          supplier: "",
          notes: "",
          actionType: "add",
        });
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) {
      return {
        label: "Out of Stock",
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="h-3 w-3" />,
      };
    }
    if (quantity <= 10) {
      return {
        label: "Low Stock",
        color: "bg-yellow-100 text-yellow-800",
        icon: <AlertTriangle className="h-3 w-3" />,
      };
    }
    return {
      label: "In Stock",
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle2 className="h-3 w-3" />,
    };
  };

  const getActionTypeBadge = (actionType) => {
    switch (actionType?.toLowerCase()) {
      case "add":
        return <Badge className="bg-green-100 text-green-800">Add</Badge>;
      case "remove":
        return <Badge className="bg-red-100 text-red-800">Remove</Badge>;
      case "adjust":
        return <Badge className="bg-blue-100 text-blue-800">Adjust</Badge>;
      default:
        return <Badge variant="outline">{actionType || "N/A"}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const calculateTotalValue = () => {
    return filteredItems.reduce(
      (total, item) => total + (item.quantity || 0) * (item.unitPrice || 0),
      0
    );
  };

  if (status === "pending" && inventoryItems.length === 0) {
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
      {/* Add/Edit Inventory Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? "Edit Inventory Item" : "Add New Inventory Item"}
            </DialogTitle>
            <DialogDescription>
              {selectedItem
                ? "Update the inventory item details below."
                : "Fill in the details to add a new inventory item."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productCode">Product Code</Label>
                  <Input
                    id="productCode"
                    name="productCode"
                    value={formData.productCode}
                    onChange={handleInputChange}
                    placeholder="SKU or product code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="tools">Tools</SelectItem>
                      <SelectItem value="spare_parts">Spare Parts</SelectItem>
                      <SelectItem value="consumables">Consumables</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actionType">Action Type *</Label>
                  <Select
                    value={formData.actionType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, actionType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">Add Stock</SelectItem>
                      <SelectItem value="remove">Remove Stock</SelectItem>
                      <SelectItem value="adjust">Adjust Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="Enter quantity"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price (KES)</Label>
                  <Input
                    id="unitPrice"
                    name="unitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={handleInputChange}
                    placeholder="Enter unit price"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Warehouse/shelf location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    placeholder="Supplier name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes or description"
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
                  : selectedItem
                  ? "Update"
                  : "Add Item"}
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
              Are you sure you want to delete this inventory item? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="py-4">
              <div className="font-medium">{selectedItem.productName}</div>
              <div className="text-sm text-gray-500">
                Product Code: {selectedItem.productCode || "N/A"}
              </div>
              <div className="text-sm text-gray-500">
                Quantity: {selectedItem.quantity || 0}
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
            <h1 className="text-2xl font-bold">Inventory Management</h1>
            <p className="text-sm text-muted-foreground">
              {filteredItems.length} items • Total Value:{" "}
              {formatCurrency(calculateTotalValue())}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Items
                </CardTitle>
                <Package className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredItems.length}</div>
                <p className="text-xs text-gray-500">
                  Unique products in inventory
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Low Stock Items
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredItems.filter((item) => (item.quantity || 0) <= 10).length}
                </div>
                <p className="text-xs text-gray-500">Items with ≤ 10 units</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Out of Stock
                </CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredItems.filter((item) => (item.quantity || 0) === 0).length}
                </div>
                <p className="text-xs text-gray-500">Items needing restock</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Value
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(calculateTotalValue())}
                </div>
                <p className="text-xs text-gray-500">Current inventory value</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory by name, code, category..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="lowStock">Low Stock</SelectItem>
                  <SelectItem value="outOfStock">Out of Stock</SelectItem>
                  <SelectItem value="add">Add Actions</SelectItem>
                  <SelectItem value="remove">Remove Actions</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date (Newest)</SelectItem>
                  <SelectItem value="quantity">Quantity</SelectItem>
                  <SelectItem value="unitPrice">Price</SelectItem>
                  <SelectItem value="productName">Name</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => dispatch(getInventoryLogs())}
                disabled={status === "pending"}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>

              <Button onClick={handleAddItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <Card>
          <CardHeader className="border-b p-4">
            <CardTitle className="text-lg">Inventory Logs</CardTitle>
            <CardDescription>
              Track all inventory movements and stock levels
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Action Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center h-24">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Package className="w-12 h-12 text-muted-foreground" />
                        <div>
                          <h3 className="text-lg font-medium">
                            No inventory items found
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {searchTerm || filterType !== "all"
                              ? "Try adjusting your search or filter criteria"
                              : "Add your first inventory item by clicking 'Add Item'"}
                          </p>
                        </div>
                        <Button variant="outline" onClick={handleAddItem}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add First Item
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const stockStatus = getStockStatus(item.quantity || 0);
                    const totalValue = (item.quantity || 0) * (item.unitPrice || 0);

                    return (
                      <TableRow key={item._id || item.id}>
                        <TableCell>
                          <div className="font-medium">{item.productName}</div>
                          {item.supplier && (
                            <div className="text-xs text-gray-500">
                              Supplier: {item.supplier}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">
                            {item.productCode || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category || "Uncategorized"}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.quantity || 0}</span>
                            <Badge className={stockStatus.color}>
                              {stockStatus.icon}
                              <span className="ml-1">{stockStatus.label}</span>
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(item.unitPrice || 0)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(totalValue)}
                        </TableCell>
                        <TableCell>{item.location || "N/A"}</TableCell>
                        <TableCell>{getActionTypeBadge(item.actionType)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(item.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditItem(item)}
                              disabled={status === "pending"}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteItem(item)}
                              disabled={status === "pending"}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div>
            Showing {filteredItems.length} of {inventoryItems.length} items
          </div>
          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => {
                // Export functionality
                console.log("Export inventory data");
              }}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => {
                // Print functionality
                window.print();
              }}
            >
              Print Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;