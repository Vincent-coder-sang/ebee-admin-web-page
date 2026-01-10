/* eslint-disable no-unused-vars */
// src/pages/admin-view/management/fines/AdminFines.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  Car,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  MoreVertical,
  ChevronDown,
  FileText,
  Users as UsersIcon,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { 
  getFine, 
  createFine, 
  updateFine, 
  deleteFine 
} from '@/features/slices/fineSlice';
import DateRangePicker from '@/components/common/date-range-picker';
import { toast } from 'react-toastify';

const AdminFines = () => {
  const dispatch = useDispatch();
  const { fines = [], status } = useSelector((state) => state.fine);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date()
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const [newFine, setNewFine] = useState({
    reason: '',
    amount: '',
    rentalId: '',
    userId: '',
    notes: ''
  });

  useEffect(() => {
    dispatch(getFine());
  }, [dispatch]);

  // Filter fines
  const filteredFines = useMemo(() => {
    if (!Array.isArray(fines)) return [];
    
    return fines.filter(fine => {
      // Status filter
      if (statusFilter !== 'all' && fine.status !== statusFilter) {
        return false;
      }

      // Date filter
      if (dateRange.start && dateRange.end && fine.createdAt) {
        const fineDate = new Date(fine.createdAt);
        if (fineDate < dateRange.start || fineDate > dateRange.end) {
          return false;
        }
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          (fine.reason?.toLowerCase().includes(searchLower)) ||
          (fine.user?.name?.toLowerCase().includes(searchLower)) ||
          (fine.user?.email?.toLowerCase().includes(searchLower)) ||
          (fine.rental?.id?.toString().includes(searchLower)) ||
          (fine.id?.toString().includes(searchLower))
        );
      }

      return true;
    });
  }, [fines, statusFilter, dateRange, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!Array.isArray(fines)) return {
      total: 0,
      totalAmount: 0,
      pending: 0,
      pendingAmount: 0,
      paid: 0,
      paidAmount: 0,
      overdue: 0
    };

    const initialStats = {
      total: 0,
      totalAmount: 0,
      pending: 0,
      pendingAmount: 0,
      paid: 0,
      paidAmount: 0,
      overdue: 0
    };

    return fines.reduce((acc, fine) => {
      acc.total += 1;
      acc.totalAmount += parseFloat(fine.amount || 0);
      
      // Check if fine has status, default to 'pending' if not
      const status = fine.status || 'pending';
      
      if (status === 'pending') {
        acc.pending += 1;
        acc.pendingAmount += parseFloat(fine.amount || 0);
        
        // Check if overdue (assuming dueDate exists, if not use created date + 7 days)
        const dueDate = fine.dueDate || new Date(new Date(fine.createdAt).setDate(new Date(fine.createdAt).getDate() + 7));
        if (new Date(dueDate) < new Date()) {
          acc.overdue += 1;
        }
      } else if (status === 'paid') {
        acc.paid += 1;
        acc.paidAmount += parseFloat(fine.amount || 0);
      }

      return acc;
    }, initialStats);
  }, [fines]);

  const handleCreateFine = () => {
    if (!newFine.reason || !newFine.amount || !newFine.rentalId || !newFine.userId) {
      toast.error('Please fill all required fields');
      return;
    }

    dispatch(createFine(newFine))
      .unwrap()
      .then(() => {
        setShowCreateModal(false);
        setNewFine({
          reason: '',
          amount: '',
          rentalId: '',
          userId: '',
          notes: ''
        });
        toast.success('Fine created successfully!');
      })
      .catch(error => {
        toast.error(`Error creating fine: ${error}`);
      });
  };

  const handleUpdateFine = () => {
    if (!selectedFine) return;

    const fineId = selectedFine.id || selectedFine._id;
    if (!fineId) return;

    dispatch(updateFine({ 
      fineId, 
      fineData: { 
        amount: selectedFine.amount, 
        reason: selectedFine.reason 
      } 
    }))
      .unwrap()
      .then(() => {
        setShowEditModal(false);
        setSelectedFine(null);
        toast.success('Fine updated successfully!');
      })
      .catch(error => {
        toast.error(`Error updating fine: ${error}`);
      });
  };

  const handleDeleteFine = (fineId) => {
    if (!window.confirm('Are you sure you want to delete this fine?')) {
      return;
    }

    dispatch(deleteFine(fineId))
      .unwrap()
      .then(() => {
        toast.success('Fine deleted successfully!');
      })
      .catch(error => {
        toast.error(`Error deleting fine: ${error}`);
      });
  };

  const handleMarkAsPaid = (fine) => {
    if (!window.confirm('Mark this fine as paid?')) {
      return;
    }
    
    const fineId = fine.id || fine._id;
    dispatch(updateFine({ 
      fineId, 
      fineData: { status: 'paid' } 
    }))
      .unwrap()
      .then(() => {
        toast.success('Fine marked as paid!');
      })
      .catch(error => {
        toast.error(`Error updating fine: ${error}`);
      });
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'waived': return 'bg-blue-100 text-blue-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'waived': return <XCircle className="h-4 w-4" />;
      case 'disputed': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'waived', label: 'Waived' },
    { value: 'disputed', label: 'Disputed' },
  ];

  const isLoading = status === 'pending';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fines Management</h1>
          <p className="text-gray-600 mt-2">
            Manage rental fines, penalties, and overdue charges
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => dispatch(getFine())}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Fine
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Fines</p>
                <h3 className="text-2xl font-bold">{stats.total}</h3>
                <div className="flex items-center mt-1">
                  <AlertTriangle className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600">
                    {stats.overdue} overdue
                  </span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <h3 className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</h3>
                <div className="flex items-center mt-1">
                  <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">
                    {formatCurrency(stats.paidAmount)} collected
                  </span>
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
                <p className="text-sm text-gray-500">Pending Fines</p>
                <h3 className="text-2xl font-bold">{stats.pending}</h3>
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-yellow-600">
                    {formatCurrency(stats.pendingAmount)} pending
                  </span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Paid Fines</p>
                <h3 className="text-2xl font-bold">{stats.paid}</h3>
                <div className="flex items-center mt-1">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">
                    {stats.total > 0 ? ((stats.paid / stats.total) * 100).toFixed(0) : 0}% collection rate
                  </span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-purple-600" />
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
                  placeholder="Search fines by reason, user, or rental..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full"
                />
              </div>
              
              <DateRangePicker 
                dateRange={dateRange}
                onChange={setDateRange}
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

      {/* Fines Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2">Loading fines...</p>
            </div>
          ) : filteredFines.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No fines found for the selected filters</p>
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
                      Fine ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rental
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFines.map((fine) => {
                    const fineId = fine.id || fine._id;
                    const fineStatus = fine.status || 'pending';
                    
                    return (
                      <tr key={fineId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{fineId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {fine.user?.name || 'Unknown User'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {fine.user?.email || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Rental #{fine.rentalId || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {fine.reason || 'No reason provided'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-red-600">
                            {formatCurrency(fine.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Badge className={getStatusColor(fineStatus)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(fineStatus)}
                                {fineStatus}
                              </span>
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {fine.createdAt ? new Date(fine.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center space-x-2">
                            {fineStatus === 'pending' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleMarkAsPaid(fine)}
                                className="text-green-600 hover:text-green-800"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedFine(fine);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteFine(fineId)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Fine Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Fine</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={newFine.userId}
                    onChange={(e) => setNewFine({...newFine, userId: e.target.value})}
                    placeholder="Enter user ID"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rental ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={newFine.rentalId}
                    onChange={(e) => setNewFine({...newFine, rentalId: e.target.value})}
                    placeholder="Enter rental ID"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={newFine.reason}
                    onChange={(e) => setNewFine({...newFine, reason: e.target.value})}
                    placeholder="Enter fine reason"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (KES) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newFine.amount}
                    onChange={(e) => setNewFine({...newFine, amount: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={newFine.notes}
                    onChange={(e) => setNewFine({...newFine, notes: e.target.value})}
                    placeholder="Additional notes..."
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateFine}>
                  Create Fine
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Fine Modal */}
      {showEditModal && selectedFine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Fine #{selectedFine.id || selectedFine._id}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (KES) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={selectedFine.amount}
                    onChange={(e) => setSelectedFine({...selectedFine, amount: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={selectedFine.reason}
                    onChange={(e) => setSelectedFine({...selectedFine, reason: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="3"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedFine(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateFine}>
                  Update Fine
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFines;