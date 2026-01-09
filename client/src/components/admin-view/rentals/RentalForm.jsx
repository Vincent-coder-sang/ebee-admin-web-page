/* eslint-disable react/prop-types */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { Calendar } from 'lucide-react';
import { useEffect } from 'react';

const RentalForm = ({ open, onOpenChange, rentalData, onSubmit }) => {
  const isEdit = !!rentalData;
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: rentalData || {
      customerName: '',
      vehicleModel: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      status: 'active',
      rentalId: `RENT-${Math.floor(Math.random() * 10000)}`,
    }
  });

  useEffect(() => {
    reset(rentalData || {
      customerName: '',
      vehicleModel: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      status: 'active',
      rentalId: `RENT-${Math.floor(Math.random() * 10000)}`,
    });
  }, [rentalData, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Rental' : 'Create New Rental'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rentalId">Rental ID</Label>
              <Input
                id="rentalId"
                {...register('rentalId')}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select {...register('status')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              {...register('customerName', { required: 'Customer name is required' })}
              error={errors.customerName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleModel">Vehicle Model *</Label>
            <Input
              id="vehicleModel"
              {...register('vehicleModel', { required: 'Vehicle model is required' })}
              error={errors.vehicleModel}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startDate"
                  type="date"
                  className="pl-10"
                  {...register('startDate', { required: 'Start date is required' })}
                  error={errors.startDate}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endDate"
                  type="date"
                  className="pl-10"
                  {...register('endDate', { required: 'End date is required' })}
                  error={errors.endDate}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? 'Update Rental' : 'Create Rental'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RentalForm;