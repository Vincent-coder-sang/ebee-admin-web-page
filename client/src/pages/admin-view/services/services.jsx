import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchServices } from "@/features/slices/serviceSlice";
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
import { MdSearch, MdAdd, MdRefresh, MdEdit, MdDelete } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify";

const AdminServices = () => {
  const dispatch = useDispatch();
  const { list: services, status, error } = useSelector((state) => state.services);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    dispatch(fetchServices());
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const refreshServices = () => {
    dispatch(fetchServices());
    toast.info("Services refreshed");
  };

  if (status === "pending") {
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

  if (status === "rejected") {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Services</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-red-500">Failed to load services: {error}</p>
            <Button onClick={() => dispatch(fetchServices())}>Retry</Button>
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
            <h1 className="text-2xl font-bold">Service Management</h1>
            <p className="text-sm text-muted-foreground">
              {filteredServices.length} {filteredServices.length === 1 ? "service" : "services"} found
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
              <Button variant="outline" onClick={refreshServices}>
                <MdRefresh className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button>
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
              /* Mobile View */
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
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MdEdit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
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
                        No services found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.id}</TableCell>
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
                              <div className="font-medium">{service.user.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {service.user.email}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">Unknown</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <MdEdit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
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