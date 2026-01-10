/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  MdEdit, 
  MdDelete, 
  MdAdd,
  MdSearch,
  MdRefresh,
  MdEmail,
  MdPerson,
  MdMessage,
  MdStar,
  MdStarBorder,
  MdCheckCircle,
  MdRemoveCircle,
  MdFilterList
} from "react-icons/md";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  getFeedbacks,
  deleteFeedback,
  updateFeedback,
  addFeedback
} from '@/features/slices/feedbackSlice';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const AdminFeedback = () => {
  const dispatch = useDispatch();
  const { list: feedbacks = [], status } = useSelector((state) => state.feedbacks);

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    rating: 5,
    status: 'pending',
    response: ''
  });

  useEffect(() => {
    dispatch(getFeedbacks());
  }, [dispatch]);

  // Filter feedbacks based on search and filter
  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (!feedback) return false;
    
    const matchesSearch = 
      feedback.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      feedback.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      feedback.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' || 
      feedback.status === filter ||
      (filter === 'high_rating' && feedback.rating >= 4) ||
      (filter === 'low_rating' && feedback.rating <= 2);
      
    return matchesSearch && matchesFilter;
  });

  const handleEditFeedback = (feedback) => {
    setEditingFeedback(feedback);
    setFormData({
      name: feedback.name || '',
      email: feedback.email || '',
      message: feedback.message || '',
      rating: feedback.rating || 5,
      status: feedback.status || 'pending',
      response: feedback.response || ''
    });
    setDialogOpen(true);
  };

  const handleDeleteFeedback = async (id) => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await dispatch(deleteFeedback(id)).unwrap();
        dispatch(getFeedbacks());
        toast.success('Feedback deleted successfully');
      } catch (error) {
        // Toast handled in slice
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      toast.error('Feedback message is required');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingFeedback) {
        await dispatch(updateFeedback({
          feedbackId: editingFeedback.id,
          data: formData
        })).unwrap();
        toast.success('Feedback updated successfully');
      } else {
        await dispatch(addFeedback(formData)).unwrap();
        toast.success('Feedback added successfully');
      }
      
      dispatch(getFeedbacks());
      handleCloseDialog();
    } catch (error) {
      // Toast handled in slice
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setFormData({
      name: '',
      email: '',
      message: '',
      rating: 5,
      status: 'pending',
      response: ''
    });
    setEditingFeedback(null);
    setDialogOpen(false);
  };

  const handleUpdateStatus = async (feedbackId, newStatus) => {
    try {
      await dispatch(updateFeedback({
        feedbackId,
        data: { status: newStatus }
      })).unwrap();
      dispatch(getFeedbacks());
      toast.success(`Feedback marked as ${newStatus}`);
    } catch (error) {
      // Toast handled in slice
    }
  };

  const refreshFeedbacks = () => {
    dispatch(getFeedbacks());
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= rating ? (
            <MdStar key={star} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          ) : (
            <MdStarBorder key={star} className="w-4 h-4 text-yellow-500" />
          )
        ))}
      </div>
    );
  };

  // Loading state
  if (status === "pending" && feedbacks.length === 0) {
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
          <h1 className="text-xl sm:text-2xl font-bold">Feedback Management</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {filteredFeedbacks.length} {filteredFeedbacks.length === 1 ? 'feedback' : 'feedbacks'} found
          </p>
        </div>
        <Button 
          onClick={() => setDialogOpen(true)}
          className="w-full sm:w-auto gap-2"
        >
          <MdAdd className="w-4 h-4" />
          <span className="text-xs sm:text-sm">Add Feedback</span>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3 sm:space-y-4">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
          <Input
            placeholder="Search feedback..."
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
                <SelectValue placeholder="Filter feedback" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Feedback</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="high_rating">High Rating (4-5)</SelectItem>
                <SelectItem value="low_rating">Low Rating (1-2)</SelectItem>
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
                { value: 'pending', label: 'Pending' },
                { value: 'reviewed', label: 'Reviewed' },
                { value: 'resolved', label: 'Resolved' },
                { value: 'high_rating', label: 'High Rating' },
                { value: 'low_rating', label: 'Low Rating' }
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
            { value: 'all', label: 'All Feedback' },
            { value: 'pending', label: 'Pending' },
            { value: 'reviewed', label: 'Reviewed' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'high_rating', label: 'High Rating (4-5)' },
            { value: 'low_rating', label: 'Low Rating (1-2)' }
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

      {/* Add/Edit Feedback Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw] mx-2">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingFeedback ? 'Edit Feedback' : 'Add New Feedback'}
            </DialogTitle>
            <DialogDescription>
              {editingFeedback ? 'Update feedback details' : 'Add new customer feedback'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="name" className="text-sm sm:text-base">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Customer name"
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
                placeholder="customer@example.com"
                disabled={isSubmitting}
                className="text-sm sm:text-base h-9 sm:h-10"
              />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="message" className="text-sm sm:text-base">Feedback Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter feedback message"
                rows={3}
                required
                disabled={isSubmitting}
                className="text-sm sm:text-base resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="rating" className="text-sm sm:text-base">Rating</Label>
                <Select 
                  value={formData.rating.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, rating: parseInt(value) }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="text-sm sm:text-base h-9 sm:h-10">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">★★★★★ (5)</SelectItem>
                    <SelectItem value="4">★★★★☆ (4)</SelectItem>
                    <SelectItem value="3">★★★☆☆ (3)</SelectItem>
                    <SelectItem value="2">★★☆☆☆ (2)</SelectItem>
                    <SelectItem value="1">★☆☆☆☆ (1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="status" className="text-sm sm:text-base">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="text-sm sm:text-base h-9 sm:h-10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {editingFeedback && (
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="response" className="text-sm sm:text-base">Admin Response</Label>
                <Textarea
                  id="response"
                  value={formData.response}
                  onChange={(e) => setFormData(prev => ({ ...prev, response: e.target.value }))}
                  placeholder="Enter your response..."
                  rows={2}
                  disabled={isSubmitting}
                  className="text-sm sm:text-base resize-none"
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCloseDialog}
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
                {isSubmitting ? 'Saving...' : editingFeedback ? 'Update Feedback' : 'Add Feedback'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Feedback List */}
      <div className="space-y-2 sm:space-y-4">
        {filteredFeedbacks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
              <MdMessage className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mb-2 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-600">No feedback found</h3>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'No feedback submitted yet'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFeedbacks.map((feedback) => (
            <Card key={feedback.id} className="p-3 sm:p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                  {/* Header with name, rating, and date */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {feedback.name || 'Anonymous'}
                        </h3>
                        <Badge 
                          variant="outline"
                          className={`text-xs px-1.5 py-0.5 ${
                            feedback.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200' :
                            feedback.status === 'reviewed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}
                        >
                          {feedback.status?.charAt(0).toUpperCase() + feedback.status?.slice(1) || 'Pending'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(feedback.rating || 0)}
                        <span className="text-xs text-gray-500">
                          {formatDate(feedback.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Email */}
                  {feedback.email && (
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                      <MdEmail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{feedback.email}</span>
                    </div>
                  )}
                  
                  {/* Feedback Message */}
                  <div className="pt-1">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {feedback.message}
                    </p>
                  </div>
                  
                  {/* Admin Response (if exists) */}
                  {feedback.response && (
                    <div className="pt-2 border-t">
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-1">
                          <Badge variant="outline" className="text-xs bg-gray-50">
                            Response
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 flex-1">
                          {feedback.response}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons - Desktop */}
                <div className="hidden sm:flex gap-1 ml-4 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditFeedback(feedback)}
                    title="Edit Feedback"
                    className="h-8 w-8 p-0"
                  >
                    <MdEdit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteFeedback(feedback.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Delete Feedback"
                  >
                    <MdDelete className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <MdCheckCircle className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleUpdateStatus(feedback.id, 'reviewed')}>
                        <MdCheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                        <span>Mark as Reviewed</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(feedback.id, 'resolved')}>
                        <MdCheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        <span>Mark as Resolved</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(feedback.id, 'pending')}>
                        <MdRemoveCircle className="mr-2 h-4 w-4 text-yellow-600" />
                        <span>Mark as Pending</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Action Menu - Mobile */}
                <div className="block sm:hidden ml-2 flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MdFilterList className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleEditFeedback(feedback)}>
                        <MdEdit className="mr-2 h-4 w-4" />
                        <span>Edit Feedback</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(feedback.id, 'reviewed')}>
                        <MdCheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                        <span>Mark as Reviewed</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(feedback.id, 'resolved')}>
                        <MdCheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        <span>Mark as Resolved</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(feedback.id, 'pending')}>
                        <MdRemoveCircle className="mr-2 h-4 w-4 text-yellow-600" />
                        <span>Mark as Pending</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteFeedback(feedback.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <MdDelete className="mr-2 h-4 w-4" />
                        <span>Delete Feedback</span>
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
                  onClick={() => handleEditFeedback(feedback)}
                  className="flex-1 text-xs h-8"
                >
                  <MdEdit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleUpdateStatus(feedback.id, 'reviewed')}
                  className="flex-1 text-xs h-8"
                >
                  <MdCheckCircle className="w-3 h-3 mr-1" />
                  Review
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center pt-4">
        <Button 
          onClick={refreshFeedbacks}
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={status === "pending"}
        >
          <MdRefresh className={`w-4 h-4 ${status === "pending" ? 'animate-spin' : ''}`} />
          Refresh Feedback
        </Button>
      </div>
    </div>
  );
};

export default AdminFeedback;