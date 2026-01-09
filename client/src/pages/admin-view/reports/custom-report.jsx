/* eslint-disable no-unused-vars */
// src/pages/admin-view/reports/CustomReports.jsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import { exportReportData, setFilters, filterPurchaseOrders  } from '@/features/slices/reportSlice';

import { 
  Download, 
  Filter, 
  Search,
  Plus,
  Trash2,
  FileText,
  Edit,
  Copy,
  BarChart3,
  Users,
  ShoppingCart,
  Wrench,
  Clock,
  User,
  ChevronDown,
  Calendar
} from "lucide-react";

const CustomReports = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list', 'create'
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [newReport, setNewReport] = useState({
    title: '',
    type: 'custom',
    content: '',
  });

  // Mock data - replace with real data from Redux
  const reports = [
    { id: 1, title: 'Monthly Sales Report', type: 'orders', createdAt: '2024-01-15', createdBy: 'Admin', content: 'Monthly sales analysis for January 2024' },
    { id: 2, title: 'User Activity Summary', type: 'users', createdAt: '2024-01-14', createdBy: 'Admin', content: 'User engagement and activity overview' },
    { id: 3, title: 'Service Performance', type: 'services', createdAt: '2024-01-13', createdBy: 'Manager', content: 'Service booking and performance metrics' },
    { id: 4, title: 'Inventory Status', type: 'inventory', createdAt: '2024-01-12', createdBy: 'Admin', content: 'Current stock levels and inventory analysis' },
    { id: 5, title: 'Q4 Financial Summary', type: 'custom', createdAt: '2024-01-11', createdBy: 'Finance', content: 'Quarter 4 financial performance report' },
  ];

  const reportTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'orders', label: 'Orders' },
    { value: 'users', label: 'Users' },
    { value: 'services', label: 'Services' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'custom', label: 'Custom' }
  ];

  const reportTemplates = [
    { id: 'sales-summary', name: 'Sales Summary', icon: <BarChart3 className="h-5 w-5" />, description: 'Generate sales performance report' },
    { id: 'user-activity', name: 'User Activity', icon: <Users className="h-5 w-5" />, description: 'User engagement analytics' },
    { id: 'service-performance', name: 'Service Performance', icon: <Wrench className="h-5 w-5" />, description: 'Service booking analysis' },
    { id: 'inventory-status', name: 'Inventory Status', icon: <ShoppingCart className="h-5 w-5" />, description: 'Stock levels and turnover' }
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'orders': return 'bg-blue-100 text-blue-800';
      case 'users': return 'bg-green-100 text-green-800';
      case 'services': return 'bg-purple-100 text-purple-800';
      case 'inventory': return 'bg-orange-100 text-orange-800';
      case 'custom': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'orders': return <ShoppingCart className="h-4 w-4" />;
      case 'users': return <Users className="h-4 w-4" />;
      case 'services': return <Wrench className="h-4 w-4" />;
      case 'inventory': return <BarChart3 className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleCreateReport = () => {
    if (!newReport.title.trim() || !newReport.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    console.log('Creating report:', newReport);
    setViewMode('list');
    setNewReport({ title: '', type: 'custom', content: '' });
  };

  const handleDeleteReport = (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      console.log('Deleting report:', id);
    }
  };

  const handleGenerateFromTemplate = (templateId) => {
    const templateContent = {
      'sales-summary': 'Sales Summary Report\n\nTotal Revenue: $0.00\nTotal Orders: 0\nAverage Order Value: $0.00\n\nGenerated on: ' + new Date().toLocaleDateString(),
      'user-activity': 'User Activity Report\n\nTotal Users: 0\nActive Users: 0\nNew Users This Month: 0\n\nGenerated on: ' + new Date().toLocaleDateString(),
      'service-performance': 'Service Performance Report\n\nTotal Bookings: 0\nCompleted Services: 0\nRevenue: $0.00\n\nGenerated on: ' + new Date().toLocaleDateString(),
      'inventory-status': 'Inventory Status Report\n\nTotal Products: 0\nLow Stock Items: 0\nOut of Stock: 0\n\nGenerated on: ' + new Date().toLocaleDateString()
    };

    setNewReport({
      title: templateId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' Report',
      type: templateId.includes('sales') ? 'orders' : 
            templateId.includes('user') ? 'users' :
            templateId.includes('service') ? 'services' : 'inventory',
      content: templateContent[templateId]
    });
    setViewMode('create');
  };

  const filteredReports = reports.filter(report => {
    if (searchTerm && !report.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (typeFilter !== 'all' && report.type !== typeFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Custom Reports</h1>
          <p className="text-gray-600 mt-2">
            Create, manage, and view custom reports from system data
          </p>
        </div>
        <Button onClick={() => setViewMode('create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Report
        </Button>
      </div>

      {viewMode === 'create' ? (
        /* Create Report Form */
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Title *
                  </label>
                  <Input
                    value={newReport.title}
                    onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                    placeholder="Enter report title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Type
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {reportTypes.slice(1).map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setNewReport({...newReport, type: type.value})}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                          newReport.type === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-2 rounded-full ${getTypeColor(type.value)} mb-2`}>
                          {getTypeIcon(type.value)}
                        </div>
                        <span className="text-xs font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Content *
                  </label>
                  <Textarea
                    value={newReport.content}
                    onChange={(e) => setNewReport({...newReport, content: e.target.value})}
                    placeholder="Enter report content..."
                    rows={8}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreateReport}
                  disabled={!newReport.title.trim() || !newReport.content.trim()}
                >
                  Create Report
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewMode('list');
                    setNewReport({ title: '', type: 'custom', content: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Report Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Templates</CardTitle>
              <p className="text-sm text-gray-500">
                Generate reports from pre-defined templates
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {reportTemplates.map(template => (
                  <div
                    key={template.id}
                    className="p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
                    onClick={() => handleGenerateFromTemplate(template.id)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        {template.icon}
                      </div>
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Report List View */
        <>
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="relative">
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="appearance-none pl-4 pr-10 py-2 border rounded-lg w-full bg-white"
                    >
                      {reportTypes.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} found
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          {filteredReports.length > 0 ? (
            <div className="space-y-4">
              {filteredReports.map(report => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getTypeColor(report.type)}`}>
                            {getTypeIcon(report.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{report.title}</h3>
                              <Badge className={getTypeColor(report.type)}>
                                {report.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              {report.content}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>Created by {report.createdBy}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{report.createdAt}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Empty State */
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No custom reports found
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || typeFilter !== 'all' 
                    ? 'Try changing your search or filter criteria'
                    : 'Create your first custom report to get started'}
                </p>
                <Button onClick={() => setViewMode('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Report
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default CustomReports;