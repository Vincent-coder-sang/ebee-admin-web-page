/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getBookings,
  updateBooking,
  deleteBooking,
} from "@/features/slices/bookingSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MdSearch,
  MdRefresh,
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdCheckCircle,
  MdCancel,
  MdPendingActions,
  MdSchedule,
} from "react-icons/md";

const AdminBookings = () => {
  const dispatch = useDispatch();
  const { list: bookings, status } = useSelector((state) => state.bookings);

  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    status: "",
    technicianId: "",
    notes: "",
  });

  useEffect(() => {
    dispatch(getBookings());
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  // Status configurations
  const statusConfig = {
    pending: {
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
      icon: <MdPendingActions className="h-4 w-4" />,
    },
    confirmed: {
      label: "Confirmed",
      color: "bg-blue-100 text-blue-800",
      icon: <MdCheckCircle className="h-4 w-4" />,
    },
    completed: {
      label: "Completed",
      color: "bg-green-100 text-green-800",
      icon: <MdCheckCircle className="h-4 w-4" />,
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-red-100 text-red-800",
      icon: <MdCancel className="h-4 w-4" />,
    },
  };

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.service?.name?.toLowerCase().includes(searchLower) ||
      booking.user?.name?.toLowerCase().includes(searchLower) ||
      booking.user?.email?.toLowerCase().includes(searchLower) ||
      booking.technician?.name?.toLowerCase().includes(searchLower) ||
      booking.status?.toLowerCase().includes(searchLower)
    );
  });

  // Handle view booking
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  // Handle edit booking
  const handleEditBooking = (booking) => {
    setSelectedBooking(booking);
    setEditForm({
      status: booking.status,
      technicianId: booking.technicianId || "",
      notes: booking.notes || "",
    });
    setIsEditModalOpen(true);
  };

  // Handle delete booking
  const handleDeleteBooking = (booking) => {
    if (window.confirm(`Are you sure you want to delete booking #${booking.id}?`)) {
      dispatch(deleteBooking(booking.id));
    }
  };

  // Save edited booking
  const saveEdit = () => {
    if (selectedBooking) {
      dispatch(
        updateBooking({
          bookingId: selectedBooking.id,
          bookingData: editForm,
        })
      );
      setIsEditModalOpen(false);
      setSelectedBooking(null);
      setEditForm({ status: "", technicianId: "", notes: "" });
    }
  };

  // Refresh bookings
  const refreshBookings = () => {
    dispatch(getBookings());
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (status === "pending" && bookings.length === 0) {
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
              <Skeleton key={i} className="w-full h-20 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* View Booking Modal */}
      {isViewModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Booking Details</h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Booking ID
                    </Label>
                    <p className="font-mono">#{selectedBooking.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Status
                    </Label>
                    <Badge className={statusConfig[selectedBooking.status]?.color}>
                      {statusConfig[selectedBooking.status]?.label ||
                        selectedBooking.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Service
                  </Label>
                  <p className="font-medium">{selectedBooking.service?.name}</p>
                  <p className="text-sm text-gray-500">
                    KES {selectedBooking.service?.price}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Customer
                    </Label>
                    <p className="font-medium">{selectedBooking.user?.name}</p>
                    <p className="text-sm text-gray-500">
                      {selectedBooking.user?.email}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Technician
                    </Label>
                    <p className="font-medium">
                      {selectedBooking.technician?.name || "Not assigned"}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Booking Date
                  </Label>
                  <p>{formatDate(selectedBooking.createdAt)}</p>
                </div>
                {selectedBooking.notes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Notes
                    </Label>
                    <p className="text-sm">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsViewModalOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {isEditModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Edit Booking</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Select status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="technicianId">Technician ID (Optional)</Label>
                  <Input
                    id="technicianId"
                    placeholder="Enter technician ID"
                    value={editForm.technicianId}
                    onChange={(e) =>
                      setEditForm({ ...editForm, technicianId: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes..."
                    value={editForm.notes}
                    onChange={(e) =>
                      setEditForm({ ...editForm, notes: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={saveEdit} className="flex-1">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold">Booking Management</h1>
            <p className="text-sm text-muted-foreground">
              {filteredBookings.length}{" "}
              {filteredBookings.length === 1 ? "booking" : "bookings"} found
            </p>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={refreshBookings}>
              <MdRefresh className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Bookings List */}
        <Card>
          <CardHeader className="border-b p-4">
            <CardTitle className="text-lg">All Bookings</CardTitle>
            <CardDescription>
              Manage customer bookings and service appointments
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isMobileView ? (
              <div className="divide-y">
                {filteredBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                    <MdSchedule className="w-12 h-12 text-muted-foreground" />
                    <h3 className="text-lg font-medium">No bookings found</h3>
                    <p className="text-muted-foreground text-sm">
                      {searchTerm
                        ? "Try adjusting your search criteria"
                        : "There are currently no bookings"}
                    </p>
                  </div>
                ) : (
                  filteredBookings.map((booking) => (
                    <div key={booking.id} className="p-4 hover:bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {booking.service?.name}
                            </span>
                            <Badge
                              className={statusConfig[booking.status]?.color}
                            >
                              {statusConfig[booking.status]?.icon}
                              <span className="ml-1">
                                {statusConfig[booking.status]?.label}
                              </span>
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {booking.user?.name} •{" "}
                            {formatDate(booking.createdAt)}
                          </div>
                          {booking.technician && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Technician:{" "}
                              </span>
                              <span className="font-medium">
                                {booking.technician.name}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewBooking(booking)}
                          >
                            <MdVisibility className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditBooking(booking)}
                          >
                            <MdEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteBooking(booking)}
                          >
                            <MdDelete className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <MdSchedule className="w-8 h-8 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            No bookings found
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-mono text-sm">
                          #{booking.id}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {booking.service?.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            KES {booking.service?.price}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{booking.user?.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {booking.user?.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          {booking.technician ? (
                            <div className="font-medium">
                              {booking.technician.name}
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">
                              Not assigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig[booking.status]?.color}>
                            {statusConfig[booking.status]?.icon}
                            <span className="ml-1">
                              {statusConfig[booking.status]?.label}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(booking.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewBooking(booking)}
                            >
                              <MdVisibility className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditBooking(booking)}
                            >
                              <MdEdit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteBooking(booking)}
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

export default AdminBookings;