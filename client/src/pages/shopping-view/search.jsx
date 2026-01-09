import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"; // Tailwind-based card components
import { Skeleton } from '@/components/ui/skeleton'; // Skeleton component for loading state
import { Button } from "@/components/ui/button";
import { searchProducts } from '@/features/slices/productSlice';

const SearchProducts = () => {
  const dispatch = useDispatch();
  const { products, status } = useSelector((state) => state.products); // Assuming state.products holds searched products

  // State for search query
  const [query, setQuery] = useState('');

  // Trigger search when query changes
  useEffect(() => {
    if (query) {
      dispatch(searchProducts({ values: { name: query } })); // Dispatch the search action with query as filter
    } else {
      dispatch(searchProducts({ values: {} })); // Dispatch search with empty object to fetch all products
    }
  }, [query, dispatch]);

  // Loading State
  if (status === 'pending') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array(8).fill().map((_, index) => (
          <Skeleton key={index} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // Error State
  if (status === 'rejected') {
    return <p className="text-center text-red-500">Failed to load products. Please try again.</p>;
  }

  // No Products Found
  if (status === 'success' && products.length === 0) {
    return <p className="text-center text-gray-500">No products found.</p>;
  }

  // Display Filtered Products
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">Search Products</h1>

      {/* Search Input */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search for products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)} // Update query state as user types
          className="w-1/2 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Display Products */}
      {status === 'success' && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="bg-white shadow-lg rounded-lg">
              <CardHeader className="p-0">
                <img
                  src={product.image || '/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
                <CardDescription className="text-gray-500 mb-2">{product.desc}</CardDescription>
                <p className="text-xl font-bold text-gray-900">${product.price?.toFixed(2)}</p>
              </CardContent>
              <CardFooter className="p-4">
                <Button className="w-full bg-blue-500 text-white hover:bg-blue-600">
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchProducts;
