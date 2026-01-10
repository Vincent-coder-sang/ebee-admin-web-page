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
  DialogDescription,
  DialogFooter
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
  MdFilterList,
  MdShoppingBag,
  MdCategory,
  MdVisibility,
  MdVisibilityOff,
  MdReply
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getFeedbacks,
  deleteFeedback,
  updateFeedback,
  addFeedback,
  getProducts
} from '@/features/slices/feedbackSlice';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const AdminFeedback = () => {
  const dispatch = useDispatch();
  const { 
    list: feedbacks = [], 
    products = [],
    status 
  } = useSelector((state) => state.feedbacks);

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isResponseDialogOpen, setResponseDialogOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    rating: 5,
    status: 'pending',
    response: '',
    productId: '',
    productName: '',
    category: '',
    isPublic: false
  });

  useEffect(() => {
    dispatch(getFeedbacks());
    dispatch(getProducts());
  }, [dispatch]);

  // Get unique product names from feedbacks
  const productNames = [...new Set(feedbacks
    .filter(f => f.productName)
    .map(f => f.productName))];

  // Filter feedbacks based on multiple criteria
  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (!feedback) return false;
    
    // Search filter
    const matchesSearch = 
      (feedback.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       feedback.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       feedback.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       feedback.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       feedback.category?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filter
    const matchesStatus = 
      filter === 'all' || 
      feedback.status === filter;
    
    // Product filter
    const matchesProduct = 
      productFilter === 'all' || 
      feedback.productName === productFilter;
    
    // Rating filter
    const matchesRating = 
      ratingFilter === 'all' ||
      (ratingFilter === '5_stars' && feedback.rating === 5) ||
      (ratingFilter === '4_stars' && feedback.rating === 4) ||
      (ratingFilter === '3_stars' && feedback.rating === 3) ||
      (ratingFilter === '2_stars' && feedback.rating === 2) ||
      (ratingFilter === '1_star' && feedback.rating === 1) ||
      (ratingFilter === 'high' && feedback.rating >= 4) ||
      (ratingFilter === 'low' && feedback.rating <= 2);
      
    return matchesSearch && matchesStatus && matchesProduct && matchesRating;
  });

  // Statistics
  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter(f => f.status === 'pending').length,
    reviewed: feedbacks.filter(f => f.status === 'reviewed').length,
    resolved: feedbacks.filter(f => f.status === 'resolved').length,
    averageRating: feedbacks.length > 0 
      ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
      : 0
  };

  const handleEditFeedback = (feedback) => {
    setEditingFeedback(feedback);
    setFormData({
      name: feedback.name || '',
      email: feedback.email || '',
      message: feedback.message || '',
      rating: feedback.rating || 5,
      status: feedback.status || 'pending',
      response: feedback.response || '',
      productId: feedback.productId || '',
      productName: feedback.productName || '',
      category: feedback.category || '',
      isPublic: feedback.isPublic || false
    });
    setDialogOpen(true);
  };

  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setViewMode('detail');
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
      response: '',
      productId: '',
      productName: '',
      category: '',
      isPublic: false
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

  const handleTogglePublic = async (feedbackId, isPublic) => {
    try {
      await dispatch(updateFeedback({
        feedbackId,
        data: { isPublic: !isPublic }
      })).unwrap();
      dispatch(getFeedbacks());
      toast.success(`Feedback ${!isPublic ? 'published' : 'unpublished'}`);
    } catch (error) {
      // Toast handled in slice
    }
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      toast.error('Response cannot be empty');
      return;
    }

    try {
      await dispatch(updateFeedback({
        feedbackId: selectedFeedback.id,
        data: { 
          response: responseText,
          status: 'resolved',
          respondedAt: new Date().toISOString()
        }
      })).unwrap();
      dispatch(getFeedbacks());
      setResponseDialogOpen(false);
      setResponseText('');
      toast.success('Response submitted successfully');
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
      <div className="p-4 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Detail View Component
  const FeedbackDetailView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewMode('list')}
          className="gap-2"
        >
          ← Back to List
        </Button>
        <h2 className="text-xl font-bold">Feedback Details</h2>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{selectedFeedback.name || 'Anonymous'}</h3>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant={selectedFeedback.status === 'resolved' ? 'default' : 
                               selectedFeedback.status === 'reviewed' ? 'secondary' : 'outline'}>
                  {selectedFeedback.status?.toUpperCase()}
                </Badge>
                <div className="flex items-center gap-2">
                  {renderStars(selectedFeedback.rating)}
                  <span className="text-sm text-gray-500">({selectedFeedback.rating}/5)</span>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(selectedFeedback.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEditFeedback(selectedFeedback)}
              >
                <MdEdit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTogglePublic(selectedFeedback.id, selectedFeedback.isPublic)}
              >
                {selectedFeedback.isPublic ? (
                  <MdVisibilityOff className="w-4 h-4 mr-2" />
                ) : (
                  <MdVisibility className="w-4 h-4 mr-2" />
                )}
                {selectedFeedback.isPublic ? 'Unpublish' : 'Publish'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">Email</Label>
              <div className="flex items-center gap-2">
                <MdEmail className="w-4 h-4 text-gray-400" />
                <span>{selectedFeedback.email || 'Not provided'}</span>
              </div>
            </div>
            
            {selectedFeedback.productName && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Product</Label>
                <div className="flex items-center gap-2">
                  <MdShoppingBag className="w-4 h-4 text-gray-400" />
                  <span>{selectedFeedback.productName}</span>
                </div>
              </div>
            )}
            
            {selectedFeedback.category && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Category</Label>
                <div className="flex items-center gap-2">
                  <MdCategory className="w-4 h-4 text-gray-400" />
                  <span>{selectedFeedback.category}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-500">Feedback Message</Label>
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.message}</p>
              </CardContent>
            </Card>
          </div>

          {selectedFeedback.response ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">Your Response</Label>
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.response}</p>
                  {selectedFeedback.respondedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Responded on: {formatDate(selectedFeedback.respondedAt)}
                    </p>
                  )}
                </CardContent>
              </Card>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setResponseText(selectedFeedback.response);
                  setResponseDialogOpen(true);
                }}
              >
                <MdEdit className="w-4 h-4 mr-2" />
                Edit Response
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setResponseDialogOpen(true)}
              className="gap-2"
            >
              <MdReply className="w-4 h-4" />
              Add Response
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Feedback Management</h1>
          <p className="text-gray-600">
            Manage and respond to customer feedback about products
          </p>
        </div>
        <Button 
          onClick={() => setDialogOpen(true)}
          className="gap-2 w-full md:w-auto"
        >
          <MdAdd className="w-4 h-4" />
          Add Testimonial
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <MdMessage className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold">{stats.averageRating}/5</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MdStar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <MdRemoveCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold">{stats.resolved}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <MdCheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail View */}
      {viewMode === 'detail' && selectedFeedback && (
        <FeedbackDetailView />
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search feedback by customer, product, or message..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Status</Label>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Product</Label>
                  <Select value={productFilter} onValueChange={setProductFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      {productNames.map(product => (
                        <SelectItem key={product} value={product}>{product}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Rating</Label>
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5_stars">5 Stars</SelectItem>
                      <SelectItem value="4_stars">4 Stars</SelectItem>
                      <SelectItem value="3_stars">3 Stars</SelectItem>
                      <SelectItem value="2_stars">2 Stars</SelectItem>
                      <SelectItem value="1_star">1 Star</SelectItem>
                      <SelectItem value="high">High (4-5)</SelectItem>
                      <SelectItem value="low">Low (1-2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilter('all');
                      setProductFilter('all');
                      setRatingFilter('all');
                      setSearchTerm('');
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Table */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFeedbacks.length === 0 ? (
                <div className="text-center py-12">
                  <MdMessage className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600">No feedback found</h3>
                  <p className="text-gray-500 mt-2">
                    {searchTerm || filter !== 'all' || productFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria' 
                      : 'No feedback has been submitted yet'
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFeedbacks.map((feedback) => (
                        <TableRow key={feedback.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{feedback.name || 'Anonymous'}</p>
                              {feedback.email && (
                                <p className="text-sm text-gray-500">{feedback.email}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {feedback.productName ? (
                              <div className="flex items-center gap-2">
                                <MdShoppingBag className="w-4 h-4 text-gray-400" />
                                <span>{feedback.productName}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {renderStars(feedback.rating)}
                              <span className="text-sm">({feedback.rating})</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="max-w-xs truncate">{feedback.message}</p>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={feedback.status === 'resolved' ? 'default' : 
                                      feedback.status === 'reviewed' ? 'secondary' : 'outline'}
                            >
                              {feedback.status}
                            </Badge>
                            {feedback.isPublic && (
                              <Badge variant="outline" className="ml-2 bg-green-50">
                                Public
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">
                              {formatDate(feedback.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewFeedback(feedback)}
                              >
                                View
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    •••
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditFeedback(feedback)}>
                                    <MdEdit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setResponseDialogOpen(true)}>
                                    <MdReply className="mr-2 h-4 w-4" />
                                    {feedback.response ? 'Edit Response' : 'Add Response'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleTogglePublic(feedback.id, feedback.isPublic)}
                                  >
                                    {feedback.isPublic ? (
                                      <>
                                        <MdVisibilityOff className="mr-2 h-4 w-4" />
                                        Unpublish
                                      </>
                                    ) : (
                                      <>
                                        <MdVisibility className="mr-2 h-4 w-4" />
                                        Publish
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteFeedback(feedback.id)}
                                    className="text-red-600"
                                  >
                                    <MdDelete className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Add/Edit Feedback Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFeedback ? 'Edit Product Feedback' : 'Add New Testimonial'}
            </DialogTitle>
            <DialogDescription>
              {editingFeedback ? 'Update feedback details' : 'Add customer feedback for a product'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="customer@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                  placeholder="Product Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Product Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Category"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Feedback Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Customer's feedback about the product..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Select 
                  value={formData.rating.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, rating: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">★★★★★ Excellent</SelectItem>
                    <SelectItem value="4">★★★★☆ Very Good</SelectItem>
                    <SelectItem value="3">★★★☆☆ Good</SelectItem>
                    <SelectItem value="2">★★☆☆☆ Fair</SelectItem>
                    <SelectItem value="1">★☆☆☆☆ Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isPublic">Visibility</Label>
                <Select 
                  value={formData.isPublic.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, isPublic: value === 'true' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Public (Visible to all)</SelectItem>
                    <SelectItem value="false">Private (Admin only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {editingFeedback && (
              <div className="space-y-2">
                <Label htmlFor="response">Admin Response</Label>
                <Textarea
                  id="response"
                  value={formData.response}
                  onChange={(e) => setFormData(prev => ({ ...prev, response: e.target.value }))}
                  placeholder="Your response to the customer..."
                  rows={3}
                />
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingFeedback ? 'Update Feedback' : 'Add Feedback'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Response</DialogTitle>
            <DialogDescription>
              Respond to customer feedback. This will also mark the feedback as resolved.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Type your response here..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitResponse}>
              Submit Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFeedback;