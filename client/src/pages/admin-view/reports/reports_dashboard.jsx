/* eslint-disable no-unused-vars */
// src/pages/admin-view/reports/ReportsDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  ShoppingCart, 
  Wrench, 
  FileText,
  TrendingUp,
  DollarSign,
  Users,
  Star,
  Download,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  getAggregatedReportData,
  generateSalesReport,
  generateFeedbackReport 
} from '@/features/slices/reportsSlice';

const ReportsDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { summary, generatedReports, status } = useSelector((state) => state.reports);
  
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date()
  });

  useEffect(() => {
    dispatch(getAggregatedReportData());
  }, [dispatch]);

  const handleGenerateSalesReport = () => {
    dispatch(generateSalesReport({
      startDate: dateRange.start.toISOString().split('T')[0],
      endDate: dateRange.end.toISOString().split('T')[0],
      format: 'pdf'
    }));
  };

  const handleGenerateFeedbackReport = () => {
    dispatch(generateFeedbackReport({
      minRating: 4,
      format: 'pdf'
    }));
  };

  const reportCards = [
    {
      id: 'purchase-orders',
      title: "Purchase Orders",
      description: "View and export purchase order data",
      icon: <ShoppingCart className="h-8 w-8 text-blue-600" />,
      path: "/admin/reports/purchase-orders",
      stats: `${summary.totalOrders} orders`,
      color: "bg-blue-50",
      action: () => navigate('/admin/reports/purchase-orders')
    },
    {
      id: 'service-bookings',
      title: "Service Bookings",
      description: "Analyze service appointments and schedules",
      icon: <Wrench className="h-8 w-8 text-green-600" />,
      path: "/admin/reports/service-bookings",
      stats: `${summary.totalBookings} bookings`,
      color: "bg-green-50",
      action: () => navigate('/admin/reports/service-bookings')
    },
    {
      id: 'sales-report',
      title: "Sales Report",
      description: "Generate detailed sales analysis",
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      path: "#",
      stats: `$${summary.totalRevenue.toFixed(2)} revenue`,
      color: "bg-purple-50",
      action: handleGenerateSalesReport
    },
    {
      id: 'feedback-report',
      title: "Feedback Report",
      description: "Customer feedback analysis",
      icon: <Star className="h-8 w-8 text-yellow-600" />,
      path: "#",
      stats: `${summary.totalFeedbacks} reviews`,
      color: "bg-yellow-50",
      action: handleGenerateFeedbackReport
    }
  ];

  const quickStats = [
    {
      title: "Total Revenue",
      value: `$${summary.totalRevenue.toFixed(2)}`,
      icon: <DollarSign className="h-5 w-5" />,
      change: "+18%",
      color: "bg-green-500"
    },
    {
      title: "Total Orders",
      value: summary.totalOrders,
      icon: <ShoppingCart className="h-5 w-5" />,
      change: "+12%",
      color: "bg-blue-500"
    },
    {
      title: "Service Bookings",
      value: summary.totalBookings,
      icon: <Wrench className="h-5 w-5" />,
      change: "+23%",
      color: "bg-orange-500"
    },
    {
      title: "Total Customers",
      value: summary.totalUsers,
      icon: <Users className="h-5 w-5" />,
      change: "+8%",
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Generate and analyze system reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg px-3 py-2">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm">
              {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
            </span>
          </div>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Quick Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.color} text-white`}>
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-600 mt-1">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Types */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {reportCards.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${report.color}`}>
                  {report.icon}
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {report.stats}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {report.title}
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                {report.description}
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={report.action}
                disabled={status === "pending" && (report.id === 'sales-report' || report.id === 'feedback-report')}
              >
                {report.id === 'sales-report' || report.id === 'feedback-report' ? 'Generate' : 'View'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recently Generated Reports */}
      {generatedReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently Generated Reports</CardTitle>
            <p className="text-sm text-gray-500">
              Ready for download
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedReports.slice(0, 3).map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">{report.reportName || report.fileName}</p>
                      <p className="text-sm text-gray-500">
                        Generated {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(report.downloadUrl, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Data Overview</CardTitle>
          <p className="text-sm text-gray-500">
            System data available for reporting
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Orders Data</h4>
                <ShoppingCart className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-600 mb-2">Total orders: {summary.totalOrders}</p>
              <p className="text-sm text-gray-600 mb-2">Total revenue: ${summary.totalRevenue.toFixed(2)}</p>
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/admin/reports/purchase-orders')}>
                View Orders Report
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Services Data</h4>
                <Wrench className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 mb-2">Total bookings: {summary.totalBookings}</p>
              <p className="text-sm text-gray-600 mb-2">Services available: {summary.totalServices}</p>
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/admin/reports/service-bookings')}>
                View Services Report
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Customer Data</h4>
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-sm text-gray-600 mb-2">Total customers: {summary.totalUsers}</p>
              <p className="text-sm text-gray-600 mb-2">Feedback reviews: {summary.totalFeedbacks}</p>
              <Button variant="outline" size="sm" className="w-full" onClick={handleGenerateFeedbackReport}>
                Generate Feedback Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsDashboard;