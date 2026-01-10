/* eslint-disable no-unused-vars */
// src/pages/admin/reports/OrderReports.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { fetchOrders } from '@/features/slices/orderSlice';
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Package
} from 'lucide-react';
import { exportReportData, setFilters } from '@/features/slices/reportSlice';
import DateRangePicker from '@/components/common/date-range-picker';

const OrderReports = () => {
  const dispatch = useDispatch();
  
  // Get data from Redux stores with safe defaults
  const reportsState = useSelector((state) => state.reports);
  const { aggregatedData = {} } = reportsState;
  const { list: orders = [], status: ordersStatus = 'idle' } = useSelector((state) => state.orders);
  
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date()
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'analytics'

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Process orders data - SAFE VERSION
  const processedOrders = useMemo(() => {
    try {
      // Safely get orders data
      let ordersData = [];
      
      // Check if aggregatedData.orders exists and is an array
      if (aggregatedData && aggregatedData.orders && Array.isArray(aggregatedData.orders)) {
        ordersData = aggregatedData.orders;
      } 
      // Otherwise use the orders from orderSlice
      else if (orders && Array.isArray(orders)) {
        ordersData = orders;
      }
      
      // Process each order
      return ordersData.map(order => ({
        ...order,
        id: order.id || order._id || Math.random().toString(36).substr(2, 9),
        revenue: parseFloat(order.total_price || order.total || order.revenue || 0),
        profit: parseFloat(order.total_price || 0) * 0.25, // 25% profit margin example
        margin: 25, // Example margin percentage
        itemsCount: order.items?.length || order.orderItems?.length || 0,
        customerName: order.user?.name || order.customerName || `Customer ${order.userId || 'Unknown'}`,
        customerEmail: order.user?.email || order.customerEmail || 'N/A',
        status: order.status || 'pending',
        created_at: order.created_at || order.createdAt || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error processing orders:', error);
      return [];
    }
  }, [aggregatedData, orders]);

  // Filter orders based on date range and status
  const filteredOrders = useMemo(() => {
    try {
      return processedOrders.filter(order => {
        // Date filter
        if (dateRange.start && dateRange.end) {
          const orderDate = new Date(order.created_at);
          if (isNaN(orderDate.getTime())) return false;
          
          if (orderDate < dateRange.start || orderDate > dateRange.end) {
            return false;
          }
        }
        
        // Status filter
        if (statusFilter !== 'all' && order.status !== statusFilter) {
          return false;
        }
        
        // Search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return (
            (order.id?.toString().includes(searchLower)) ||
            (order.customerName?.toLowerCase().includes(searchLower)) ||
            (order.customerEmail?.toLowerCase().includes(searchLower)) ||
            (order.status?.toLowerCase().includes(searchLower))
          );
        }
        
        return true;
      });
    } catch (error) {
      console.error('Error filtering orders:', error);
      return [];
    }
  }, [processedOrders, dateRange, statusFilter, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const initialStats = {
      totalOrders: 0,
      totalRevenue: 0,
      totalProfit: 0,
      totalItems: 0,
      averageOrderValue: 0,
      statusCount: {}
    };

    return filteredOrders.reduce((acc, order) => {
      acc.totalOrders += 1;
      acc.totalRevenue += order.revenue;
      acc.totalProfit += order.profit;
      acc.totalItems += order.itemsCount;
      acc.averageOrderValue = acc.totalRevenue / (acc.totalOrders || 1);
      
      // Count by status
      const status = order.status || 'unknown';
      if (!acc.statusCount[status]) {
        acc.statusCount[status] = 0;
      }
      acc.statusCount[status] += 1;
      
      return acc;
    }, initialStats);
  }, [filteredOrders]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    dispatch(setFilters({ dateRange: range }));
  };

  const handleExport = () => {
    dispatch(exportReportData({ 
      type: 'orders', 
      data: filteredOrders,
      fileName: 'order_analytics_report'
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
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

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Calculate daily revenue for chart
  const dailyRevenue = useMemo(() => {
    try {
      const days = 30;
      const data = [];
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const dayOrders = filteredOrders.filter(order => {
          try {
            const orderDate = new Date(order.created_at);
            if (isNaN(orderDate.getTime())) return false;
            
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === date.getTime();
          } catch {
            return false;
          }
        });
        
        const revenue = dayOrders.reduce((sum, order) => sum + order.revenue, 0);
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue
        });
      }
      return data;
    } catch (error) {
      console.error('Error calculating daily revenue:', error);
      return [];
    }
  }, [filteredOrders]);

  const isLoading = ordersStatus === 'pending';

  // Calculate unique customers
  const uniqueCustomers = useMemo(() => {
    const customerIds = new Set();
    filteredOrders.forEach(order => {
      if (order.userId) {
        customerIds.add(order.userId);
      }
    });
    return customerIds.size;
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Analytics Report</h1>
          <p className="text-gray-600 mt-2">
            Detailed order analytics with revenue, profit, and performance metrics
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
              className={`px-4 py-2 ${viewMode === 'analytics' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
              onClick={() => setViewMode('analytics')}
            >
              Analytics View
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
                <p className="text-sm text-gray-500">Total Orders</p>
                <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12% from last month</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-blue-600" />
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
                  <span className="text-sm text-green-600">+18% from last month</span>
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
                <p className="text-sm text-gray-500">Total Profit</p>
                <h3 className="text-2xl font-bold">${stats.totalProfit.toFixed(2)}</h3>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+15% from last month</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold">P</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Order Value</p>
                <h3 className="text-2xl font-bold">${stats.averageOrderValue.toFixed(2)}</h3>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8% from last month</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-orange-600" />
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
                  placeholder="Search orders by ID, customer, or email..."
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

      {viewMode === 'analytics' ? (
        /* Analytics View */
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {dailyRevenue.length > 0 ? (
                  <div className="flex items-end h-48 space-x-1 mt-4">
                    {dailyRevenue.slice(-10).map((day, index) => {
                      const maxRevenue = Math.max(...dailyRevenue.map(d => d.revenue), 1);
                      const heightPercent = (day.revenue / maxRevenue) * 100;
                      
                      return (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div 
                            className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                            style={{ 
                              height: `${Math.min(100, heightPercent)}%`,
                              maxHeight: '100%'
                            }}
                            title={`$${day.revenue.toFixed(2)} on ${day.date}`}
                          />
                          <div className="text-xs text-gray-500 mt-2">{day.date}</div>
                          <div className="text-xs font-medium">${day.revenue.toFixed(0)}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-gray-500">
                    No revenue data available for the selected period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.statusCount).length > 0 ? (
                  Object.entries(stats.statusCount).map(([status, count]) => {
                    const percentage = stats.totalOrders > 0 ? (count / stats.totalOrders * 100).toFixed(1) : 0;
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <Badge className={getStatusColor(status)}>
                              {status}
                            </Badge>
                          </div>
                          <span className="font-medium">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              status === 'delivered' || status === 'completed' ? 'bg-green-500' :
                              status === 'shipped' ? 'bg-blue-500' :
                              status === 'processing' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No status data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Orders */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Performing Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Profit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Margin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders
                        .sort((a, b) => b.revenue - a.revenue)
                        .slice(0, 5)
                        .map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                #{order.id}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {order.customerName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {order.customerEmail}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-green-600">
                                ${order.revenue.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-purple-600">
                                ${order.profit.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-blue-600">
                                {order.margin}%
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getStatusColor(order.status)}>
                                {order.status || 'Pending'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p>No orders found to display</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Table View */
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2">Loading order reports...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>No orders found for the selected filters</p>
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear Search
                  </Button>
                )}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Margin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
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
                            #{order.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.customerName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.customerEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-green-600">
                            ${order.revenue.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-purple-600">
                            ${order.profit.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600">
                            {order.margin}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.itemsCount}
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
      )}

      {/* Report Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Report Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Conversion Rate</span>
                  <span className="font-medium">4.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Customer Lifetime Value</span>
                  <span className="font-medium">$245.67</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Repeat Purchase Rate</span>
                  <span className="font-medium">32%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cart Abandonment</span>
                  <span className="font-medium">18%</span>
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
                  Export as PDF
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export as Excel
                </Button>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Key Insights</h4>
              <div className="space-y-2">
                <div className="flex items-start">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span className="text-sm text-gray-600">
                    Revenue increased by <strong>18%</strong> compared to last month
                  </span>
                </div>
                <div className="flex items-start">
                  <Users className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                  <span className="text-sm text-gray-600">
                    <strong>{filteredOrders.length}</strong> orders from <strong>{uniqueCustomers}</strong> unique customers
                  </span>
                </div>
                <div className="flex items-start">
                  <DollarSign className="h-4 w-4 text-purple-500 mr-2 mt-0.5" />
                  <span className="text-sm text-gray-600">
                    Average profit margin of <strong>25%</strong> across all orders
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderReports;