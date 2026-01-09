import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchServices,
  createService,
  updateService,
  deleteService,
  setCurrentService,
  clearCurrentService,
} from "@/features/slices/serviceSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MdSearch,
  MdAdd,
  MdRefresh,
  MdEdit,
  MdDelete,
  MdClose,
} from "react-icons/md";

const AdminServices = () => {
  const dispatch = useDispatch();
  const { list: services, status, error, currentService } = useSelector(
    (state) => state.services
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(fetchServices());
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  useEffect(() => {
    if (currentService) {
      setFormData({
        name: currentService.name,
        description: currentService.description,
        price: currentService.price.toString(),
      });
      setIsDialogOpen(true);
    }
  }, [currentService]);

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      errors.price = "Valid price is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const serviceData = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
    };

    if (currentService) {
      await dispatch(updateService({ ...serviceData, id: currentService.id }));
    } else {
      await dispatch(createService(serviceData));
    }

    if (status !== "rejected") {
      handleCloseDialog();
      dispatch(fetchServices()); // Refresh the list
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({ name: "", description: "", price: "" });
    setFormErrors({});
    dispatch(clearCurrentService());
  };

  const handleEdit = (service) => {
    dispatch(setCurrentService(service));
  };

  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (serviceToDelete) {
      await dispatch(deleteService(serviceToDelete.id));
      if (status !== "rejected") {
        setIsDeleteDialogOpen(false);
        setServiceToDelete(null);
      }
    }
  };

  const refreshServices = () => {
    dispatch(fetchServices());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (status === "pending" && services.length === 0) {
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
      {/* Service Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentService ? "Edit Service" : "Add New Service"}
            </DialogTitle>
            <DialogDescription>
              {currentService
                ? "Update the service details below."
                : "Fill in the details to add a new service."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter service name"
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter service description"
                  rows={3}
                  className={formErrors.description ? "border-red-500" : ""}
                />
                {formErrors.description && (
                  <p className="text-sm text-red-500">{formErrors.description}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price">Price (KES) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price in KES"
                  className={formErrors.price ? "border-red-500" : ""}
                  min="0"
                  step="0.01"
                />
                {formErrors.price && (
                  <p className="text-sm text-red-500">{formErrors.price}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={status === "pending"}>
                {status === "pending" ? "Saving..." : currentService ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              `This action cannot be undone. This will permanently delete the service
              {serviceToDelete?.name}`.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setServiceToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              {status === "pending" ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content */}
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold">Service Management</h1>
            <p className="text-sm text-muted-foreground">
              {filteredServices.length}{" "}
              {filteredServices.length === 1 ? "service" : "services"} found
            </p>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={refreshServices}
                disabled={status === "pending"}
              >
                <MdRefresh className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={() => setIsDialogOpen(true)}>
                <MdAdd className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {status === "rejected" && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <MdClose className="h-5 w-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        )}

        {/* Services List */}
        <Card>
          <CardHeader className="border-b p-4">
            <CardTitle className="text-lg">Service List</CardTitle>
            <CardDescription>
              Manage your services. Click edit to modify or delete to remove.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isMobileView ? (
              /* Mobile View */
              <div className="divide-y">
                {filteredServices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                    <MdSearch className="w-12 h-12 text-muted-foreground" />
                    <h3 className="text-lg font-medium">No services found</h3>
                    <p className="text-muted-foreground text-sm">
                      {searchTerm
                        ? "Try adjusting your search criteria"
                        : "Add your first service by clicking 'Add Service'"}
                    </p>
                  </div>
                ) : (
                  filteredServices.map((service) => (
                    <div key={service.id} className="p-4 hover:bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {service.description}
                          </div>
                          <Badge variant="secondary" className="mt-2">
                            KES {parseFloat(service.price).toLocaleString()}
                          </Badge>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(service)}
                            disabled={status === "pending"}
                          >
                            <MdEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteClick(service)}
                            disabled={status === "pending"}
                          >
                            <MdDelete className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      {service.user && (
                        <div className="mt-3 text-sm">
                          <div className="text-muted-foreground">Created by:</div>
                          <div className="font-medium">{service.user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {service.user.email}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Desktop View */
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Price (KES)</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="text-right w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <MdSearch className="w-8 h-8 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            No services found
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-mono text-sm">
                          #{service.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {service.name}
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <div className="truncate" title={service.description}>
                            {service.description}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">
                            KES {parseFloat(service.price).toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {service.user ? (
                            <div>
                              <div className="font-medium">{service.user.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {service.user.email}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">
                              System
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(service)}
                              disabled={status === "pending"}
                            >
                              <MdEdit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(service)}
                              disabled={status === "pending"}
                            >
                              <MdDelete className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminServices;