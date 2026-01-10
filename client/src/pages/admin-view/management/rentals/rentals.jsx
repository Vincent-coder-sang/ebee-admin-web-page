import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Trash, Calendar, Clock, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';
import {
  getRental,
  deleteRental,
} from '@/features/slices/rentalSlice';

const AdminRentals = () => {
  const dispatch = useDispatch();
  const { list: rentals, status } = useSelector((state) => state.rental);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch rentals on component mount
  useEffect(() => {
    dispatch(getRental());
  }, [dispatch]);

  // Filter rentals based on search term
  const filteredRentals = rentals.filter((rental) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      rental.customerName?.toLowerCase().includes(searchLower) ||
      rental.vehicleModel?.toLowerCase().includes(searchLower) ||
      rental.rentalId?.toLowerCase().includes(searchLower) ||
      rental.status?.toLowerCase().includes(searchLower)
    );
  });

  // Handle rental deletion
  const handleDelete = (rentalId) => {
    if (window.confirm('Are you sure you want to delete this rental?')) {
      dispatch(deleteRental(rentalId))
        .unwrap()
        .then(() => {
          toast.success('Rental deleted successfully');
        })
        .catch((error) => {
          toast.error(error.message || 'Failed to delete rental');
        });
    }
  };

  // Get badge variant based on status
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      case 'upcoming':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Car className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Rental Management</h1>
            <p className="text-sm text-muted-foreground">
              View and manage rental bookings. For creating/editing rentals, use the mobile app.
            </p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-100 rounded-lg px-4 py-2">
          <span className="font-medium">Note:</span> Rental creation/editing available on mobile app only
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Rentals</p>
          <p className="text-2xl font-bold">{rentals.length}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold">
            {rentals.filter(r => r.status?.toLowerCase() === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold">
            {rentals.filter(r => r.status?.toLowerCase() === 'completed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Revenue</p>
          <p className="text-2xl font-bold">
            ${rentals
              .filter(r => r.status?.toLowerCase() === 'completed')
              .reduce((sum, r) => sum + (r.totalAmount || 0), 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search rentals by customer, vehicle, ID, or status..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Rentals Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rental ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRentals.length > 0 ? (
              filteredRentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>#{rental.rentalId || rental.id?.slice(-6)}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(rental.createdAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{rental.customerName || 'N/A'}</span>
                      <span className="text-xs text-muted-foreground">
                        {rental.customerEmail || rental.customerPhone || ''}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{rental.vehicleModel || 'N/A'}</span>
                      <span className="text-xs text-muted-foreground">
                        {rental.vehiclePlate || ''}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span>{formatDate(rental.startDate)}</span>
                        <span className="text-xs text-muted-foreground">to</span>
                        <span>{formatDate(rental.endDate)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {rental.duration || 'N/A'} days
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      ${rental.totalAmount?.toLocaleString() || '0'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(rental.status)}>
                      {rental.status?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(rental.id)}
                      className="hover:bg-destructive hover:text-destructive-foreground"
                      title="Delete rental"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  {status === 'pending' ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Loading rentals...
                    </div>
                  ) : searchTerm ? (
                    `No rentals found matching "${searchTerm}"`
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Car className="h-12 w-12 text-muted-foreground" />
                      <p>No rentals found</p>
                      <p className="text-sm text-muted-foreground">
                        All rental operations are performed through the mobile app
                      </p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer Note */}
      <div className="text-center text-sm text-muted-foreground border-t pt-4">
        <p>
          💡 <strong>Service Manager Access:</strong> For creating, editing, and managing rentals in real-time, 
          please use the dedicated mobile application available to service managers.
        </p>
      </div>
    </div>
  );
};

export default AdminRentals;