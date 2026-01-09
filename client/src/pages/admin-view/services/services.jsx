import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchServices,
  createService,
  updateService,
  deleteService,
} from "@/features/slices/serviceSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MdSearch, MdAdd, MdRefresh, MdEdit, MdDelete } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const AdminServices = () => {
  const dispatch = useDispatch();
  const { list: services = [], status } = useSelector((state) => state.services);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  useEffect(() => {
    dispatch(fetchServices());
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  // SAFE FILTERING
  const filteredServices = Array.isArray(services) 
    ? services.filter((service) => {
        if (!service) return false;
        const name = service.name || "";
        const description = service.description || "";
        const searchLower = searchTerm.toLowerCase();
        return (
          name.toLowerCase().includes(searchLower) ||
          description.toLowerCase().includes(searchLower)
        );
      })
    : [];

  const refreshServices = () => {
    dispatch(fetchServices());
  };

  const handleAddClick = () => {
    setEditingService(null);
    setFormData({ name: "", description: "", price: "" });
    setShowForm(true);
  };

  const handleEditClick = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || "",
      description: service.description || "",
      price: service.price?.toString() || "",
    });
    setShowForm(true);
  };

  const handleDeleteClick = (serviceId) => {
    // don't use window.confirm here use a beutiful modal
    if (window.confirm("Are you sure you want to delete this service?")) {
      dispatch(deleteService(serviceId)).then(() => {
        // Refresh services after successful deletion
        dispatch(fetchServices());
      });
    }
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  
  // Validate form
  if (!formData.name.trim() || !formData.description.trim() || !formData.price) {
    alert("Please fill in all fields");
    return;
  }
  
  // Convert price to number
  const serviceData = {
    name: formData.name.trim(),
    description: formData.description.trim(),
    price: parseFloat(formData.price),
  };
  
  if (editingService) {
    dispatch(updateService({
      serviceData: serviceData,
      serviceId: editingService.id
    })).then(() => {
      // Refresh after update
      dispatch(fetchServices());
    });
  } else {
    dispatch(createService(serviceData)).then(() => {
      // Refresh after create
      dispatch(fetchServices());
    });
  }
  
  setShowForm(false);
  setFormData({ name: "", description: "", price: "" });
  setEditingService(null);
};
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      {/* Simple Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editingService ? "Edit Service" : "Add Service"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="mb-2 block">
                    Service Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter service name"
                    disabled={status === "pending"}
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="mb-2 block">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter service description"
                    rows={3}
                    disabled={status === "pending"}
                  />
                </div>
                <div>
                  <Label htmlFor="price" className="mb-2 block">
                    Price (KES) *
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter price"
                    disabled={status === "pending"}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                    disabled={status === "pending"}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={status === "pending"}
                  >
                    {status === "pending" ? "Saving..." : editingService ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
              <Button 
                onClick={handleAddClick}
                disabled={status === "pending"}
              >
                <MdAdd className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </div>
          </div>
        </div>

        {/* Services List */}
        <Card>
          <CardHeader className="border-b p-4">
            <CardTitle className="text-lg">Service List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isMobileView ? (
              <div className="divide-y">
                {filteredServices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                    <MdSearch className="w-12 h-12 text-muted-foreground" />
                    <h3 className="text-lg font-medium">No services found</h3>
                    <p className="text-muted-foreground text-sm">
                      {searchTerm
                        ? "Try adjusting your search criteria"
                        : "There are currently no services"}
                    </p>
                  </div>
                ) : (
                  filteredServices.map((service) => (
                    <div key={service.id} className="p-4 hover:bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {service.description}
                          </div>
                          <Badge className="mt-2">KES {service.price}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditClick(service)}
                            disabled={status === "pending"}
                          >
                            <MdEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteClick(service.id)}
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Price (KES)</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <MdSearch className="w-12 h-12 text-muted-foreground" />
                          <div>
                            <h3 className="text-lg font-medium">No services found</h3>
                            <p className="text-muted-foreground text-sm">
                              {searchTerm
                                ? "Try adjusting your search criteria"
                                : "There are currently no services"}
                            </p>
                          </div>
                          <Button variant="outline" onClick={handleAddClick}>
                            <MdAdd className="mr-2 h-4 w-4" />
                            Add First Service
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">
                          {service.id}
                        </TableCell>
                        <TableCell>{service.name}</TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {service.description}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">KES {service.price}</Badge>
                        </TableCell>
                        <TableCell>
                          {service.user ? (
                            <div>
                              <div className="font-medium">
                                {service.user.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {service.user.email}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">
                              Unknown
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(service)}
                              disabled={status === "pending"}
                            >
                              <MdEdit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(service.id)}
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