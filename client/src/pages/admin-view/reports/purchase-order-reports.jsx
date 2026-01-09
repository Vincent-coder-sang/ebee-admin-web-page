/* eslint-disable no-unused-vars */
// src/pages/admin/reports/PurchaseOrders.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { exportReportData, setFilters, filterPurchaseOrders  } from '@/features/slices/reportSlice';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Filter, 
  Calendar, 
  ShoppingCart,
  Search,
  ChevronDown,
  Eye,
  Printer
} from 'lucide-react';
import DateRangePicker from '@/components/common/date-range-picker';


const PurchaseOrdersReport = () => {
  const dispatch = useDispatch();
  const { 
    aggregatedData,
    purchaseOrders,
    filters,
    loading 
  } = useSelector((state) => state.reports);
  
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date()
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(filterPurchaseOrders({ 
      dateRange,
      status: statusFilter !== 'all' ? statusFilter : null 
    }));
  }, [dispatch, dateRange, statusFilter]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    dispatch(setFilters({ dateRange: range }));
  };

  const handleExport = () => {
    dispatch(exportReportData({ 
      type: 'orders', 
      data: purchaseOrders,
      fileName: 'purchase_orders_report'
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = purchaseOrders.filter(order => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (order.id?.toString().includes(searchLower)) ||
      (order.user?.name?.toLowerCase().includes(searchLower)) ||
      (order.status?.toLowerCase().includes(searchLower)) ||
      (order.payment_method?.toLowerCase().includes(searchLower))
    );
  });

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const calculateStats = () => {
    const stats = {
      total: purchaseOrders.length,
      totalRevenue: purchaseOrders.reduce((sum, order) => sum + (parseFloat(order.total_price) || 0), 0),
      pending: purchaseOrders.filter(order => order.status === 'pending').length,
      completed: purchaseOrders.filter(order => order.status === 'delivered' || order.status === 'completed').length
    };
    return stats;
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Orders Report</h1>
          <p className="text-gray-600 mt-2">
            Track and analyze all purchase orders in the system
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <h3 className="text-2xl font-bold">{stats.total}</h3>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</h3>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold">$</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Orders</p>
                <h3 className="text-2xl font-bold">{stats.pending}</h3>
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-yellow-600 font-bold">!</span>
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
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
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
                  placeholder="Search orders..."
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
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No purchase orders found for the selected filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
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
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id || order._id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.user?.name || `User #${order.userId}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.user?.email || 'No email'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          ${parseFloat(order.total_price || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status || 'Pending'}
                        </Badge>
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

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Order Status Distribution</h4>
              <div className="space-y-2">
                {statusOptions.slice(1).map(status => {
                  const count = purchaseOrders.filter(order => order.status === status.value).length;
                  const percentage = stats.total > 0 ? (count / stats.total * 100).toFixed(1) : 0;
                  return (
                    <div key={status.value} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{status.label}</span>
                      <span className="font-medium">{count} ({percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Revenue by Status</h4>
              <div className="space-y-2">
                {statusOptions.slice(1).map(status => {
                  const revenue = purchaseOrders
                    .filter(order => order.status === status.value)
                    .reduce((sum, order) => sum + (parseFloat(order.total_price) || 0), 0);
                  return (
                    <div key={status.value} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{status.label}</span>
                      <span className="font-medium">${revenue.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Report Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Full Report
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Analytics
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseOrdersReport;