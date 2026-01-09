// src/pages/admin-view/reports/reports.jsx
import React from 'react';
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
  Package
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminReports = () => {
  const navigate = useNavigate();

  const reportCards = [
    {
      title: "Purchase Orders",
      description: "Track and analyze purchase orders with revenue details",
      icon: <ShoppingCart className="h-8 w-8 text-blue-600" />,
      path: "/admin/reports/purchase-orders",
      stats: "1,234 orders",
      color: "bg-blue-50"
    },
    {
      title: "Service Bookings",
      description: "Monitor service appointments and technician performance",
      icon: <Wrench className="h-8 w-8 text-green-600" />,
      path: "/admin/reports/service-bookings",
      stats: "567 bookings",
      color: "bg-green-50"
    },
    {
      title: "Order Analytics",
      description: "Detailed order analytics with revenue and margin analysis",
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      path: "/admin/reports/orders",
      stats: "$45,678 revenue",
      color: "bg-purple-50"
    },
    {
      title: "Custom Reports",
      description: "Create and manage custom reports from system data",
      icon: <FileText className="h-8 w-8 text-orange-600" />,
      path: "/admin/reports/custom",
      stats: "24 reports",
      color: "bg-orange-50"
    }
  ];

  const quickStats = [
    {
      title: "Total Revenue",
      value: "$45,678",
      icon: <DollarSign className="h-5 w-5" />,
      change: "+18%",
      color: "bg-green-500"
    },
    {
      title: "Total Orders",
      value: "1,234",
      icon: <ShoppingCart className="h-5 w-5" />,
      change: "+12%",
      color: "bg-blue-500"
    },
    {
      title: "Active Bookings",
      value: "567",
      icon: <Wrench className="h-5 w-5" />,
      change: "+23%",
      color: "bg-orange-500"
    },
    {
      title: "Growth Rate",
      value: "15.2%",
      icon: <TrendingUp className="h-5 w-5" />,
      change: "+3.2%",
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
            Access and analyze system performance reports
          </p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
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
      <div className="grid gap-6 md:grid-cols-2">
        {reportCards.map((report) => (
          <Card key={report.title} className="hover:shadow-lg transition-shadow">
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
              <p className="text-gray-600 mb-4">
                {report.description}
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(report.path)}
              >
                View Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Report Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Purchase Orders Report</p>
                  <p className="text-sm text-gray-500">Generated today at 10:30 AM</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Download
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Wrench className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Service Bookings Summary</p>
                  <p className="text-sm text-gray-500">Generated yesterday at 2:15 PM</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Download
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Monthly Revenue Analysis</p>
                  <p className="text-sm text-gray-500">Generated 2 days ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;