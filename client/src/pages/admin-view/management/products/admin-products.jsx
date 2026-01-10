/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
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
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  MdEdit, 
  MdDelete, 
  MdAdd,
  MdInventory,
  MdAttachMoney,
  MdCategory,
  MdDescription,
  MdImage
} from "react-icons/md";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createProduct, fetchProducts, removeProduct, updateProduct } from '@/features/slices/productSlice';
import { toast } from 'react-toastify';

const AdminProducts = () => {
  const dispatch = useDispatch();
  const { list: products, status } = useSelector((state) => state.products);
  const { id } = useSelector((state) => state.auth);

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'bike',
    stockQuantity: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(price);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }
    setFormData(prev => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category: 'bike',
      stockQuantity: '',
      image: null
    });
    setImagePreview(null);
    setEditingProduct(null);
  };

  const handleCloseDialog = () => {
    resetForm();
    setDialogOpen(false);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Product name is required";
    if (formData.price <= 0) return "Price must be greater than 0";
    if (formData.stockQuantity < 0) return "Stock quantity cannot be negative";
    if (!formData.description.trim()) return "Description is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    
    const formPayload = new FormData();
    formPayload.append('name', formData.name);
    formPayload.append('price', formData.price);
    formPayload.append('description', formData.description);
    formPayload.append('category', formData.category);
    formPayload.append('stockQuantity', formData.stockQuantity);
    formPayload.append('userId', id);

    if (formData.image) {
      formPayload.append('my_file', formData.image);
    }

    try {
      if (editingProduct) {
        await dispatch(updateProduct({
          productId: editingProduct.id,
          values: formPayload
        })).unwrap();
        toast.success('Product updated successfully');
      } else {
        await dispatch(createProduct(formPayload)).unwrap();
        toast.success('Product created successfully');
      }
      
      dispatch(fetchProducts());
      handleCloseDialog();
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      stockQuantity: product.stockQuantity.toString(),
      image: null
    });
    setImagePreview(product.imageUrl);
    setDialogOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(removeProduct(id)).unwrap();
        dispatch(fetchProducts());
        toast.success('Product deleted successfully');
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (status === "pending") {
    return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <Skeleton className="w-48 h-8 mb-2" />
            <Skeleton className="w-32 h-4" />
          </div>
          <Skeleton className="w-32 h-10" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="w-full h-48" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="w-3/4 h-6" />
                <Skeleton className="w-1/2 h-4" />
                <Skeleton className="w-1/3 h-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">Products</h1>
          <p className="text-gray-600">
            {products?.length || 0} {products?.length === 1 ? 'product' : 'products'} available
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="gap-2"
        >
          <MdAdd className="w-5 h-5" />
          Add Product
        </Button>
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form Layout - Responsive */}
            <div className="space-y-4">
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label htmlFor="image" className="flex items-center gap-2">
                  <MdImage className="w-4 h-4" />
                  Product Image
                </Label>
                <div className="flex flex-col gap-4 sm:flex-row">
                  {/* Image Preview - Side by side on mobile, better responsive */}
                  <div className="flex-1">
                    <Input
                      id="image"
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="cursor-pointer"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Max size: 2MB
                    </p>
                    {editingProduct && !imagePreview && (
                      <p className="mt-2 text-sm text-gray-500">
                        Leave empty to keep current image
                      </p>
                    )}
                  </div>
                  
                  {/* Image Preview - Better sizing */}
                  {imagePreview && (
                    <div className="flex-shrink-0">
                      <div className="relative w-full sm:w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute top-2 right-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setImagePreview(null);
                              setFormData(prev => ({ ...prev, image: null }));
                            }}
                            className="w-8 h-8 bg-white/90 hover:bg-white"
                          >
                            <MdDelete className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <MdInventory className="w-4 h-4" />
                    Product Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category" className="flex items-center gap-2">
                    <MdCategory className="w-4 h-4" />
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bike">Bike</SelectItem>
                      <SelectItem value="accessory">Accessory</SelectItem>
                      <SelectItem value="part">Part</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center gap-2">
                    <MdAttachMoney className="w-4 h-4" />
                    Price (KES)
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity" className="flex items-center gap-2">
                    <MdInventory className="w-4 h-4" />
                    Stock Quantity
                  </Label>
                  <Input
                    id="stockQuantity"
                    name="stockQuantity"
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <MdDescription className="w-4 h-4" />
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows={3}
                  required
                  className="resize-none"
                />
              </div>
            </div>

            {/* Dialog Actions - Always visible at bottom */}
            <div className="flex flex-col gap-2 pt-4 border-t sm:flex-row sm:justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCloseDialog}
                disabled={isSubmitting}
                className="sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="gap-2 sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {editingProduct ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingProduct ? 'Update Product' : 'Create Product'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Products Grid */}
      {products?.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden transition-shadow hover:shadow-md">
              <div className="relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="object-cover w-full h-48"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEditProduct(product)}
                    className="w-8 h-8 bg-white/90 hover:bg-white"
                  >
                    <MdEdit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                    className="w-8 h-8 bg-white/90 hover:bg-white text-red-600"
                  >
                    <MdDelete className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg font-semibold leading-tight">
                    {product.name}
                  </CardTitle>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      product.category === 'bike' ? 'bg-blue-50 text-blue-700' :
                      product.category === 'accessory' ? 'bg-green-50 text-green-700' :
                      'bg-purple-50 text-purple-700'
                    }`}
                  >
                    {product.category}
                  </Badge>
                </div>
                
                <p className="text-lg font-bold text-gray-800 mb-1">
                  {formatPrice(product.price)}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Stock: {product.stockQuantity}
                </p>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MdInventory className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No products found</h3>
          <p className="text-gray-500 mb-4">Start by adding your first product</p>
          <Button onClick={() => setDialogOpen(true)}>
            <MdAdd className="w-5 h-5 mr-2" />
            Add Product
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;