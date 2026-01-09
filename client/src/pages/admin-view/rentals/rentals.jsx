import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Trash, Edit, Calendar, Clock, Car } from 'lucide-react';
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
  createRental,
  deleteRental,
} from '@/features/slices/rentalSlice';
import { updateRental } from '@/features/slices/rentalSlice';
import RentalForm from '@/components/admin-view/rentals/RentalForm';

const AdminRentals = () => {
  const dispatch = useDispatch();
  const { list: rentals, status } = useSelector((state) => state.rental);
  const [searchTerm, setSearchTerm] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [currentRental, setCurrentRental] = useState(null);

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
      rental.rentalId?.toLowerCase().includes(searchLower)
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Car className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Rental Management</h1>
        </div>
        <Button onClick={() => {
          setCurrentRental(null);
          setOpenForm(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Rental
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search rentals by customer, vehicle, or ID..."
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
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRentals.length > 0 ? (
              filteredRentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell className="font-medium">#{rental.rentalId}</TableCell>
                  <TableCell>{rental.customerName}</TableCell>
                  <TableCell>{rental.vehicleModel}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(rental.startDate).toLocaleDateString()} - {' '}
                        {new Date(rental.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {rental.duration} days
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        rental.status === 'active'
                          ? 'default'
                          : rental.status === 'completed'
                          ? 'success'
                          : 'destructive'
                      }
                    >
                      {rental.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setCurrentRental(rental);
                        setOpenForm(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(rental.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  {status === 'pending' ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Loading rentals...
                    </div>
                  ) : (
                    'No rentals found'
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Rental Form Modal */}
      <RentalForm
        open={openForm}
        onOpenChange={setOpenForm}
        rentalData={currentRental}
        onSubmit={(data) => {
          if (currentRental) {
            // Update existing rental
            dispatch(updateRental({ rentalId: currentRental.id, data }))
              .unwrap()
              .then(() => {
                toast.success('Rental updated successfully');
                setOpenForm(false);
              })
              .catch((error) => {
                toast.error(error.message || 'Failed to update rental');
              });
          } else {
            // Create new rental
            dispatch(createRental(data))
              .unwrap()
              .then(() => {
                toast.success('Rental created successfully');
                setOpenForm(false);
              })
              .catch((error) => {
                toast.error(error.message || 'Failed to create rental');
              });
          }
        }}
      />
    </div>
  );
};

export default AdminRentals;