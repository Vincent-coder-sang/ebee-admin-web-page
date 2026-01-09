/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MdEdit, 
  MdDelete, 
  MdPerson, 
  MdEmail, 
  MdSearch,
  MdRefresh,
  MdCheck,
  MdClose,
  MdPhone
} from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, updateUser, deleteUser, approveUser } from '@/features/slices/usersSlice';
import { toast } from 'react-toastify';

const AdminUsers = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userType: 'customer',
    phoneNumber: '',
    isApproved: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const { list: users = [], status } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Filter users based on search and filter
  const filteredUsers = users.filter(user => {
    if (!user) return false;
    
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' || 
      user.userType === filter ||
      (filter === 'approved' && user.isApproved) ||
      (filter === 'pending' && !user.isApproved);
      
    return matchesSearch && matchesFilter;
  });

  const handleEditUser = (user) => {
    if (!user) {
      toast.error('Invalid user data');
      return;
    }
    
    const userId = user.id || user._id;
    
    if (!userId) {
      toast.error('User ID is missing');
      return;
    }
    
    const userWithId = { ...user, id: userId };
    
    setEditingUser(userWithId);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      userType: user.userType || 'customer',
      phoneNumber: user.phoneNumber || '',
      isApproved: user.isApproved || false
    });
    setDialogOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!userId) return;
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        dispatch(fetchUsers());
      } catch (error) {
        // Toast handled in slice
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingUser?.id) return;
    
    setIsSubmitting(true);
    try {
      await dispatch(updateUser({
        userId: editingUser.id,
        userData: formData
      })).unwrap();
      
      dispatch(fetchUsers());
      setDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      // Toast handled in slice
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveUser = async (userId, approve) => {
    if (!userId) return;
    
    try {
      await dispatch(updateUser({
        userId,
        userData: { isApproved: approve }
      })).unwrap();
      
      dispatch(fetchUsers());
    } catch (error) {
      // Toast handled in slice
    }
  };

  const refreshUsers = () => {
    dispatch(fetchUsers());
  };

  // Format user type for display
  const formatUserType = (userType) => {
    return userType?.charAt(0).toUpperCase() + userType?.slice(1) || 'Customer';
  };

  // Loading state
  if (status === "pending") {
    return (
      <div className="p-4 space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full h-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-600">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
          </p>
        </div>
        <Button onClick={refreshUsers} variant="outline" size="sm">
          <MdRefresh className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { value: 'all', label: 'All Users' },
            { value: 'admin', label: 'Admins' },
            { value: 'customer', label: 'Customers' },
            { value: 'approved', label: 'Approved' },
            { value: 'pending', label: 'Pending' }
          ].map((filterType) => (
            <Button
              key={filterType.value}
              variant={filter === filterType.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterType.value)}
              className="whitespace-nowrap"
            >
              {filterType.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setEditingUser(null);
          setIsSubmitting(false);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select 
                id="role"
                value={formData.userType}
                onChange={(e) => setFormData(prev => ({ ...prev, userType: e.target.value }))}
                className="w-full p-2 border rounded-md"
                disabled={isSubmitting}
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
                <option value="technician">Technician</option>
                <option value="driver">Driver</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <MdPerson className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600">No users found</h3>
              <p className="text-gray-500">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'No users registered yet'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <Badge 
                      variant={user.isApproved ? "default" : "secondary"}
                      className={user.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                    >
                      {user.isApproved ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MdEmail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  
                  {user.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MdPhone className="w-4 h-4 flex-shrink-0" />
                      <span>{user.phoneNumber}</span>
                    </div>
                  )}
                  
                  <Badge variant="outline" className="text-xs">
                    {formatUserType(user.userType)}
                  </Badge>
                </div>
                
                <div className="flex gap-1 ml-4 flex-shrink-0">
                  {!user.isApproved ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApproveUser(user.id, true)}
                      title="Approve User"
                    >
                      <MdCheck className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApproveUser(user.id, false)}
                      title="Revoke Approval"
                    >
                      <MdClose className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditUser(user)}
                    title="Edit User"
                  >
                    <MdEdit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Delete User"
                  >
                    <MdDelete className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminUsers;