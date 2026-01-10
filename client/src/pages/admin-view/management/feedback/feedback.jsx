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
  MdStar,
  MdStarBorder,
  MdCheckCircle,
  MdFilterList,
  MdShoppingBag,
  MdChat,
  MdVisibility,
  MdVisibilityOff,
  MdReply,
  MdArrowBack
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
} from '@/features/slices/feedbackSlice';
import { fetchProducts } from '@/features/slices/productSlice';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const AdminFeedback = () => {
  const dispatch = useDispatch();
  const { 
    list: feedbacks = [], 
    status 
  } = useSelector((state) => state.feedbacks);
  
  const { list: products = [] } = useSelector((state) => state.products);

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isResponseDialogOpen, setResponseDialogOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    userId: '',
    productId: ''
  });

  useEffect(() => {
    dispatch(getFeedbacks());
    dispatch(fetchProducts());
  }, [dispatch]);

  // Ensure feedbacks is always an array and add safe properties
  const feedbacksArray = Array.isArray(feedbacks) ? feedbacks.map(feedback => ({
    ...feedback,
    id: feedback.id || '',
    rating: feedback.rating || 0,
    comment: feedback.comment || '',
    userId: feedback.userId || '',
    productId: feedback.productId || '',
    createdAt: feedback.createdAt || '',
    updatedAt: feedback.updatedAt || '',
    // Include nested user data safely
    user: feedback.user || { id: '', name: 'Anonymous', email: '' },
    // Include nested product data safely
    product: feedback.product || { id: '', name: 'Unknown Product' }
  })) : [];

  // Ensure products is always an array
  const productsArray = Array.isArray(products) ? products : [];

  // Get unique product names from feedbacks
  const productNames = [...new Set(feedbacksArray
    .filter(f => f && f.product && f.product.name)
    .map(f => f.product.name))];

  // Filter feedbacks based on multiple criteria
  const filteredFeedbacks = feedbacksArray.filter(feedback => {
    if (!feedback) return false;
    
    // Search filter
    const matchesSearch = 
      (feedback.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       feedback.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       feedback.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       feedback.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      !searchTerm;
    
    // Status filter - Note: Your model doesn't have status, so we'll use rating as filter
    const matchesStatus = filter === 'all' || filter === 'all';
    
    // Product filter
    const matchesProduct = 
      productFilter === 'all' || 
      feedback.product?.name === productFilter;
    
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
    total: feedbacksArray.length,
    averageRating: feedbacksArray.length > 0 
      ? (feedbacksArray.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacksArray.length).toFixed(1)
      : 0,
    fiveStar: feedbacksArray.filter(f => f.rating === 5).length,
    oneStar: feedbacksArray.filter(f => f.rating === 1).length
  };

  const handleEditFeedback = (feedback) => {
    setEditingFeedback(feedback);
    setFormData({
      rating: feedback.rating || 5,
      comment: feedback.comment || '',
      userId: feedback.userId || '',
      productId: feedback.productId || ''
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
        toast.success('Feedback deleted successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to delete feedback');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.comment.trim()) {
      toast.error('Comment is required');
      return;
    }

    if (!formData.productId) {
      toast.error('Product selection is required');
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
      toast.error(error.message || 'Failed to save feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setFormData({
      rating: 5,
      comment: '',
      userId: '',
      productId: ''
    });
    setEditingFeedback(null);
    setDialogOpen(false);
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
          respondedAt: new Date().toISOString()
        }
      })).unwrap();
      dispatch(getFeedbacks());
      setResponseDialogOpen(false);
      setResponseText('');
      toast.success('Response submitted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to submit response');
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
    const ratingValue = rating || 0;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= ratingValue ? (
            <MdStar key={star} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          ) : (
            <MdStarBorder key={star} className="w-4 h-4 text-yellow-500" />
          )
        ))}
      </div>
    );
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600 bg-green-50';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Loading state
  if (status === "pending" && feedbacksArray.length === 0) {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('list')}
            className="gap-2"
          >
            <MdArrowBack className="w-4 h-4" />
            Back to List
          </Button>
          <h2 className="text-xl font-bold">Feedback Details</h2>
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
            variant="destructive"
            onClick={() => handleDeleteFeedback(selectedFeedback.id)}
          >
            <MdDelete className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold">{selectedFeedback?.user?.name || 'Anonymous'}</h3>
                <Badge className={`px-3 py-1 ${getRatingColor(selectedFeedback?.rating)}`}>
                  {renderStars(selectedFeedback?.rating)}
                  <span className="ml-2 font-medium">{selectedFeedback?.rating || 0}/5</span>
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Submitted on: {formatDate(selectedFeedback?.createdAt)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Customer Information</Label>
                <Card className="bg-gray-50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <MdPerson className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{selectedFeedback?.user?.name || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MdEmail className="w-4 h-4 text-gray-400" />
                      <span>{selectedFeedback?.user?.email || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">User ID:</span>
                      <span className="text-sm font-mono">{selectedFeedback?.userId || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Product Information</Label>
                <Card className="bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MdShoppingBag className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">{selectedFeedback?.product?.name || 'Unknown Product'}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Product ID:</span> {selectedFeedback?.productId || 'N/A'}
                    </div>
                    {selectedFeedback?.product?.category && (
                      <div className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Category:</span> {selectedFeedback.product.category}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-500">Customer Feedback</Label>
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <MdChat className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedFeedback?.comment || 'No comment provided'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-500">Admin Response</Label>
            {selectedFeedback?.response ? (
              <>
                <Card className="bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <MdReply className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.response}</p>
                        {selectedFeedback.respondedAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Responded on: {formatDate(selectedFeedback.respondedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setResponseText(selectedFeedback.response);
                    setResponseDialogOpen(true);
                  }}
                  className="mt-2"
                >
                  <MdEdit className="w-4 h-4 mr-2" />
                  Edit Response
                </Button>
              </>
            ) : (
              <Card className="bg-gray-100">
                <CardContent className="p-4 text-center">
                  <p className="text-gray-500 mb-3">No response yet</p>
                  <Button
                    onClick={() => setResponseDialogOpen(true)}
                    className="gap-2"
                  >
                    <MdReply className="w-4 h-4" />
                    Add Response
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
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
            Manage customer feedback for products
          </p>
        </div>
        <Button 
          onClick={() => setDialogOpen(true)}
          className="gap-2 w-full md:w-auto"
        >
          <MdAdd className="w-4 h-4" />
          Add Feedback
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
                <MdChat className="w-6 h-6 text-blue-600" />
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
                <p className="text-sm font-medium text-gray-600">5-Star Ratings</p>
                <p className="text-2xl font-bold">{stats.fiveStar}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <MdStar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">1-Star Ratings</p>
                <p className="text-2xl font-bold">{stats.oneStar}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <MdStar className="w-6 h-6 text-red-600" />
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
                  placeholder="Search by customer name, email, or feedback..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div className="flex items-center justify-between">
                <CardTitle>Customer Feedback</CardTitle>
                <Button 
                  onClick={refreshFeedbacks}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={status === "pending"}
                >
                  <MdRefresh className={`w-4 h-4 ${status === "pending" ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredFeedbacks.length === 0 ? (
                <div className="text-center py-12">
                  <MdChat className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600">No feedback found</h3>
                  <p className="text-gray-500 mt-2">
                    {searchTerm || productFilter !== 'all' || ratingFilter !== 'all' 
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
                        <TableHead>Comment</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFeedbacks.map((feedback) => (
                        <TableRow key={feedback.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <p className="font-medium">{feedback.user?.name || 'Anonymous'}</p>
                              {feedback.user?.email && (
                                <p className="text-sm text-gray-500 truncate max-w-[200px]">{feedback.user.email}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MdShoppingBag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="truncate max-w-[150px]">{feedback.product?.name || 'Unknown'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {renderStars(feedback.rating)}
                              <span className={`text-sm font-medium ${getRatingColor(feedback.rating)} px-2 py-1 rounded`}>
                                {feedback.rating || 0}/5
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="truncate">{feedback.comment || 'No comment'}</p>
                            </div>
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
                                  {!feedback.response && (
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedFeedback(feedback);
                                      setResponseDialogOpen(true);
                                    }}>
                                      <MdReply className="mr-2 h-4 w-4" />
                                      Add Response
                                    </DropdownMenuItem>
                                  )}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingFeedback ? 'Edit Feedback' : 'Add New Feedback'}
            </DialogTitle>
            <DialogDescription>
              {editingFeedback ? 'Update feedback details' : 'Add customer feedback for a product'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productId">Product *</Label>
              <Select 
                value={formData.productId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, productId: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {productsArray.map(product => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating *</Label>
              <Select 
                value={formData.rating.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, rating: parseInt(value) }))}
                required
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
              <Label htmlFor="comment">Comment *</Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Enter customer feedback..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">User ID *</Label>
              <Input
                id="userId"
                type="number"
                value={formData.userId}
                onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                placeholder="Enter user ID"
                required
              />
            </div>

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
              Respond to customer feedback
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