import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProducts } from "@/features/slices/productSlice";
import { addProductToCart } from "@/features/slices/cartSlice";

// Skeleton loader for product cards
const ProductSkeleton = () => (
  <Card className="bg-white shadow-lg rounded-lg">
    <CardHeader className="p-0">
      <Skeleton className="w-full h-48 rounded-t-lg" />
    </CardHeader>
    <CardContent className="p-4">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <Skeleton className="h-8 w-1/3" />
    </CardContent>
    <CardFooter className="p-4">
      <Skeleton className="h-10 w-full" />
    </CardFooter>
  </Card>
);

const ShoppingHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize navigate

  const { list: products, status, error } = useSelector((state) => state?.products);
  const { id } = useSelector((state) => state.auth);
  const [query, setQuery] = useState("");
  const [loadingProductId, setLoadingProductId] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    return products?.filter(
      (product) =>
        product?.name?.toLowerCase().includes(query.toLowerCase()) ||
        product?.description?.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, products]);

  const handleAddProductToCart = async (product) => {
    if (!id) {
      console.error("User ID is missing");
      return;
    }

    if (!product?.id) {
      console.error("Product ID is missing");
      return;
    }

    setLoadingProductId(product?.id);
    try {
      await dispatch(addProductToCart({ userId: id, productId: product.id })).unwrap();
    } catch (error) {
      console.error("Failed to add product:", error);
    } finally {
      setLoadingProductId(null);
    }
  };

  // Function to navigate to Product Details
  const handleViewProduct = (productId) => {
    navigate(`/shop/product/${productId}`);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">Product List</h1>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search for products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-1/2 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {status === "pending" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)]?.map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      )}

      {status === "rejected" && <p className="text-center text-red-500">Failed to load products. {error}</p>}

      {status === "success" && filteredProducts?.length === 0 && (
        <p className="text-center text-gray-500">No products found.</p>
      )}

      {status === "success" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts?.map((product) => (
            <Card key={product?.id} className="bg-white shadow-lg rounded-lg">
              <CardHeader
                className="p-0 cursor-pointer"
                onClick={() => handleViewProduct(product?.id)} // Navigate on click
              >
                <img
                  src={product?.imageUrl || "/placeholder.jpg"}
                  alt={product?.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle
                  className="text-lg font-semibold cursor-pointer"
                  onClick={() => handleViewProduct(product?.id)} // Navigate on click
                >
                  {product?.name}
                </CardTitle>
                <CardDescription className="text-gray-500 mb-2">{product?.description}</CardDescription>
                <p className="text-xl font-bold text-gray-900">Ksh {product?.price}</p>
              </CardContent>
              <CardFooter className="p-4">
                <Button
                  className="w-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                  onClick={() => handleAddProductToCart(product)}
                  disabled={loadingProductId === product?.id}
                >
                  {loadingProductId === product?.id ? "Adding..." : "Add to Cart"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShoppingHome;
