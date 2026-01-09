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
  MdPhone,
  MdMoreVert,
  MdFilterList
} from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, updateUser, deleteUser, approveUser } from '@/features/slices/usersSlice';
import { toast } from 'react-toastify';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [showFilters, setShowFilters] = useState(false);

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
      <div className="p-3 sm:p-4 space-y-4">
        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="w-40 sm:w-48 h-7 sm:h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="w-28 sm:w-32 h-3 sm:h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-full sm:w-32 h-9 sm:h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full h-16 sm:h-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">User Management</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
          </p>
        </div>
        <Button 
          onClick={refreshUsers} 
          variant="outline" 
          size="sm"
          className="w-full sm:w-auto"
        >
          <MdRefresh className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="text-xs sm:text-sm">Refresh</span>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3 sm:space-y-4">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
          <Input
            placeholder="Search by name or email..."
            className="pl-8 sm:pl-9 text-sm sm:text-base h-9 sm:h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Mobile Filter Dropdown */}
        <div className="block sm:hidden">
          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="flex-shrink-0"
            >
              <MdFilterList className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Expandable filters on mobile */}
          {showFilters && (
            <div className="mt-2 flex flex-wrap gap-1">
              {[
                { value: 'all', label: 'All' },
                { value: 'admin', label: 'Admins' },
                { value: 'customer', label: 'Customers' },
                { value: 'approved', label: 'Approved' },
                { value: 'pending', label: 'Pending' }
              ].map((filterType) => (
                <Button
                  key={filterType.value}
                  variant={filter === filterType.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilter(filterType.value);
                    setShowFilters(false);
                  }}
                  className="text-xs h-7 px-2"
                >
                  {filterType.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        
        {/* Desktop Filter Buttons */}
        <div className="hidden sm:flex gap-2 overflow-x-auto pb-2">
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
              className="whitespace-nowrap text-xs sm:text-sm"
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
        <DialogContent className="sm:max-w-md max-w-[95vw] mx-2">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="name" className="text-sm sm:text-base">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                disabled={isSubmitting}
                className="text-sm sm:text-base h-9 sm:h-10"
              />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                disabled={isSubmitting}
                className="text-sm sm:text-base h-9 sm:h-10"
              />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="phone" className="text-sm sm:text-base">Phone</Label>
              <Input
                id="phone"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                disabled={isSubmitting}
                className="text-sm sm:text-base h-9 sm:h-10"
              />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="role" className="text-sm sm:text-base">Role</Label>
              <select 
                id="role"
                value={formData.userType}
                onChange={(e) => setFormData(prev => ({ ...prev, userType: e.target.value }))}
                className="w-full p-2 border rounded-md text-sm sm:text-base h-9 sm:h-10"
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
                className="flex-1 text-sm sm:text-base h-9 sm:h-10"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 text-sm sm:text-base h-9 sm:h-10"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Users List */}
      <div className="space-y-2 sm:space-y-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
              <MdPerson className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mb-2 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-600">No users found</h3>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'No users registered yet'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="p-3 sm:p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      {user.name}
                    </h3>
                    <Badge 
                      variant={user.isApproved ? "default" : "secondary"}
                      className={`text-xs px-1.5 py-0.5 ${
                        user.isApproved 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {user.isApproved ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                    <MdEmail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  
                  {user.phoneNumber && (
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                      <MdPhone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{user.phoneNumber}</span>
                    </div>
                  )}
                  
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {formatUserType(user.userType)}
                  </Badge>
                </div>
                
                {/* Action Buttons - Desktop */}
                <div className="hidden sm:flex gap-1 ml-4 flex-shrink-0">
                  {!user.isApproved ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApproveUser(user.id, true)}
                      title="Approve User"
                      className="h-8 w-8 p-0"
                    >
                      <MdCheck className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApproveUser(user.id, false)}
                      title="Revoke Approval"
                      className="h-8 w-8 p-0"
                    >
                      <MdClose className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditUser(user)}
                    title="Edit User"
                    className="h-8 w-8 p-0"
                  >
                    <MdEdit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteUser(user.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Delete User"
                  >
                    <MdDelete className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Action Menu - Mobile */}
                <div className="block sm:hidden ml-2 flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MdMoreVert className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {!user.isApproved ? (
                        <DropdownMenuItem onClick={() => handleApproveUser(user.id, true)}>
                          <MdCheck className="mr-2 h-4 w-4" />
                          <span>Approve User</span>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleApproveUser(user.id, false)}>
                          <MdClose className="mr-2 h-4 w-4" />
                          <span>Revoke Approval</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleEditUser(user)}>
                        <MdEdit className="mr-2 h-4 w-4" />
                        <span>Edit User</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <MdDelete className="mr-2 h-4 w-4" />
                        <span>Delete User</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Quick Actions - Mobile */}
              <div className="flex sm:hidden gap-2 mt-3 pt-3 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditUser(user)}
                  className="flex-1 text-xs h-8"
                >
                  <MdEdit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                {!user.isApproved ? (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleApproveUser(user.id, true)}
                    className="flex-1 text-xs h-8"
                  >
                    <MdCheck className="w-3 h-3 mr-1" />
                    Approve
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleApproveUser(user.id, false)}
                    className="flex-1 text-xs h-8"
                  >
                    <MdClose className="w-3 h-3 mr-1" />
                    Revoke
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminUsers;