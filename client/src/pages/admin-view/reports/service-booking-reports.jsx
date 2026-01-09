/* eslint-disable no-unused-vars */
// src/pages/admin/reports/ServiceBookingReports.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  exportReportData,
  setFilters 
} from '../../../redux/slices/reportsSlice';
import { getBookings } from '../../../redux/slices/bookingSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Filter, 
  Calendar, 
  Search,
  ChevronDown,
  Eye,
  Printer,
  Clock,
  User,
  Wrench,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Calendar as CalendarIcon
} from 'lucide-react';
import DateRangePicker from '../../../components/reports/DateRangePicker';

const ServiceBookingReports = () => {
  const dispatch = useDispatch();
  
  // Get data from Redux stores
  const { aggregatedData } = useSelector((state) => state.reports);
  const { list: bookings, status: bookingsStatus } = useSelector((state) => state.bookings);
  
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date()
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'

  useEffect(() => {
    dispatch(getBookings());
  }, [dispatch]);

  // Process bookings data
  const processedBookings = useMemo(() => {
    const bookingsData = aggregatedData.bookings && aggregatedData.bookings.length > 0 
      ? aggregatedData.bookings 
      : bookings || [];
    
    return bookingsData.map(booking => ({
      ...booking,
      customerName: booking.user?.name || `Customer ${booking.userId}`,
      customerEmail: booking.user?.email || 'N/A',
      serviceName: booking.service?.name || `Service ${booking.serviceId}`,
      servicePrice: parseFloat(booking.price || 0),
      scheduledDate: booking.scheduled_date || booking.date || booking.created_at,
      duration: booking.duration || '1 hour',
      technician: booking.technician || 'Not assigned'
    }));
  }, [aggregatedData.bookings, bookings]);

  // Filter bookings based on criteria
  const filteredBookings = useMemo(() => {
    return processedBookings.filter(booking => {
      // Date filter
      if (dateRange.start && dateRange.end) {
        const bookingDate = new Date(booking.scheduledDate || booking.created_at);
        if (bookingDate < dateRange.start || bookingDate > dateRange.end) {
          return false;
        }
      }
      
      // Status filter
      if (statusFilter !== 'all' && booking.status !== statusFilter) {
        return false;
      }
      
      // Service type filter (simplified)
      if (serviceTypeFilter !== 'all') {
        // This would need actual service type data from your backend
        if (booking.serviceType !== serviceTypeFilter) {
          return false;
        }
      }
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          (booking.id?.toString().includes(searchLower)) ||
          (booking.customerName?.toLowerCase().includes(searchLower)) ||
          (booking.customerEmail?.toLowerCase().includes(searchLower)) ||
          (booking.serviceName?.toLowerCase().includes(searchLower)) ||
          (booking.technician?.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    });
  }, [processedBookings, dateRange, statusFilter, serviceTypeFilter, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    return filteredBookings.reduce((acc, booking) => {
      acc.totalBookings += 1;
      acc.totalRevenue += booking.servicePrice;
      
      // Count by status
      if (!acc.statusCount[booking.status]) {
        acc.statusCount[booking.status] = 0;
      }
      acc.statusCount[booking.status] += 1;
      
      // Count completed vs cancelled
      if (booking.status === 'completed' || booking.status === 'confirmed') {
        acc.completed += 1;
      } else if (booking.status === 'cancelled') {
        acc.cancelled += 1;
      }
      
      return acc;
    }, {
      totalBookings: 0,
      totalRevenue: 0,
      completed: 0,
      cancelled: 0,
      statusCount: {}
    });
  }, [filteredBookings]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    dispatch(setFilters({ dateRange: range }));
  };

  const handleExport = () => {
    dispatch(exportReportData({ 
      type: 'bookings', 
      data: filteredBookings,
      fileName: 'service_bookings_report'
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Mock service types - you would get this from your services data
  const serviceTypeOptions = [
    { value: 'all', label: 'All Services' },
    { value: 'repair', label: 'Repair' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'installation', label: 'Installation' },
    { value: 'inspection', label: 'Inspection' }
  ];

  // Group bookings by date for calendar view
  const bookingsByDate = useMemo(() => {
    const grouped = {};
    filteredBookings.forEach(booking => {
      const date = new Date(booking.scheduledDate).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(booking);
    });
    return grouped;
  }, [filteredBookings]);

  // Get upcoming bookings (next 7 days)
  const upcomingBookings = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return filteredBookings.filter(booking => {
      const bookingDate = new Date(booking.scheduledDate);
      return bookingDate >= today && bookingDate <= nextWeek;
    });
  }, [filteredBookings]);

  const isLoading = bookingsStatus === 'pending';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Bookings Report</h1>
          <p className="text-gray-600 mt-2">
            Track and analyze service appointments, schedules, and technician performance
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <button
              className={`px-4 py-2 ${viewMode === 'table' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
              onClick={() => setViewMode('table')}
            >
              Table View
            </button>
            <button
              className={`px-4 py-2 ${viewMode === 'calendar' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
              onClick={() => setViewMode('calendar')}
            >
              Calendar View
            </button>
          </div>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <h3 className="text-2xl font-bold">{stats.totalBookings}</h3>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+15% from last month</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</h3>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+22% from last month</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <h3 className="text-2xl font-bold">{stats.completed}</h3>
                <div className="flex items-center mt-1">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">{stats.totalBookings > 0 ? ((stats.completed / stats.totalBookings) * 100).toFixed(0) : 0}% completion rate</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Upcoming (7 days)</p>
                <h3 className="text-2xl font-bold">{upcomingBookings.length}</h3>
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600">Next {upcomingBookings.length} appointments</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Filters</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer, service, or technician..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full"
                />
              </div>
              
              <DateRangePicker 
                dateRange={dateRange}
                onChange={handleDateRangeChange}
              />
              
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 border rounded-lg w-full"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              <div className="relative">
                <select
                  value={serviceTypeFilter}
                  onChange={(e) => setServiceTypeFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 border rounded-lg w-full"
                >
                  {serviceTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {viewMode === 'calendar' ? (
        /* Calendar View */
        <div className="grid gap-6">
          {/* Calendar Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Bookings Calendar</CardTitle>
              <p className="text-sm text-gray-500">
                Showing bookings for the selected date range
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {/* Calendar Header */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar Grid - Simplified 5-week view */}
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 35 }).map((_, index) => {
                      const date = new Date();
                      date.setDate(date.getDate() - date.getDay() + index);
                      const dateStr = date.toDateString();
                      const dayBookings = bookingsByDate[dateStr] || [];
                      
                      return (
                        <div
                          key={index}
                          className={`min-h-24 border rounded-lg p-2 ${
                            date.toDateString() === new Date().toDateString() 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-700 mb-1">
                            {date.getDate()}
                          </div>
                          {dayBookings.slice(0, 2).map((booking, idx) => (
                            <div
                              key={idx}
                              className="text-xs p-1 mb-1 rounded truncate"
                              style={{
                                backgroundColor: booking.status === 'completed' ? '#D1FAE5' :
                                                booking.status === 'cancelled' ? '#FEE2E2' :
                                                booking.status === 'confirmed' ? '#DBEAFE' :
                                                '#FEF3C7'
                              }}
                              title={`${booking.serviceName} - ${booking.customerName}`}
                            >
                              <div className="font-medium truncate">{booking.serviceName}</div>
                              <div className="truncate">{booking.customerName}</div>
                            </div>
                          ))}
                          {dayBookings.length > 2 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dayBookings.length - 2} more
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments (Next 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-600' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {getStatusIcon(booking.status)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{booking.serviceName}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <User className="h-3 w-3" />
                            <span>{booking.customerName}</span>
                            <Wrench className="h-3 w-3 ml-2" />
                            <span>{booking.technician}</span>
                            <Clock className="h-3 w-3 ml-2" />
                            <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <CalendarIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>No upcoming appointments in the next 7 days</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Table View */
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading service bookings...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Wrench className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>No service bookings found for the selected filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Technician
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{booking.id || booking._id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(booking.scheduledDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(booking.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.customerName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.customerEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.serviceName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.technician}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.duration}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-green-600">
                            ${booking.servicePrice.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Badge className={getStatusColor(booking.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(booking.status)}
                                {booking.status || 'Pending'}
                              </span>
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Service Performance & Summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.statusCount).map(([status, count]) => {
                const percentage = stats.totalBookings > 0 ? (count / stats.totalBookings * 100).toFixed(1) : 0;
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={getStatusColor(status) + ' px-2 py-1 rounded text-xs'}>
                          {status}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{count}</span>
                        <span className="text-gray-500 ml-2">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          status === 'completed' || status === 'confirmed' ? 'bg-green-500' :
                          status === 'cancelled' ? 'bg-red-500' :
                          status === 'in_progress' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Technician Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Technician Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* This would use actual technician data from your system */}
              {['John Technician', 'Sarah Engineer', 'Mike Specialist'].map((tech, index) => {
                const techBookings = filteredBookings.filter(b => b.technician === tech);
                const completed = techBookings.filter(b => b.status === 'completed').length;
                const total = techBookings.length;
                const completionRate = total > 0 ? ((completed / total) * 100).toFixed(0) : 0;
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{tech}</h4>
                        <p className="text-sm text-gray-500">{total} bookings assigned</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{completionRate}%</div>
                      <div className="text-xs text-gray-500">completion rate</div>
                    </div>
                  </div>
                );
              })}
              
              <Button variant="outline" className="w-full">
                View All Technicians
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Report Summary & Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Key Insights</h4>
              <div className="space-y-2">
                <div className="flex items-start">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span className="text-sm text-gray-600">
                    Service bookings increased by <strong>15%</strong> this month
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span className="text-sm text-gray-600">
                    <strong>{stats.completed}</strong> out of <strong>{stats.totalBookings}</strong> bookings completed
                  </span>
                </div>
                <div className="flex items-start">
                  <DollarSign className="h-4 w-4 text-purple-500 mr-2 mt-0.5" />
                  <span className="text-sm text-gray-600">
                    Generated <strong>${stats.totalRevenue.toFixed(2)}</strong> in service revenue
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Export Options</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Technician Schedule
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Export Calendar
                </Button>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Wrench className="h-4 w-4 mr-2" />
                  Schedule New Service
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Assign Technician
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Filter className="h-4 w-4 mr-2" />
                  Set Up Auto-Reports
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  View Conflicts
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceBookingReports;