import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  decreaseProductQuantity,
  getCart,
  increaseProductQuantity,
  removeProductFromCart,
} from "@/features/slices/cartSlice";
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
import { Minus, Plus, Trash } from "lucide-react"; // ✅ Icons for plus, minus, and remove
import {  useNavigate } from "react-router-dom";

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart?.list || []); // ✅ Prevents undefined error
  const status = useSelector((state) => state.cart?.status || null);
  const { id } = useSelector((state) => state.auth); // ✅ Get userId from Redux
  const [loadingCartId, setLoadingCartId] = useState(null); // Track which item is being removed

  useEffect(() => {
    if (id) {
      dispatch(getCart(id));
    }
  }, [dispatch, id]);

  const handleRemoveItem = async (cartId) => {
    setLoadingCartId(cartId); // ✅ Start loading state
    try {
      await dispatch(removeProductFromCart({ userId: id, cartId })).unwrap(); // ✅ Pass userId
    } catch (error) {
      console.error("Failed to remove product:", error);
    } finally {
      setLoadingCartId(null); // ✅ Reset loading state
    }
  };
  

  const handleUpdateQuantity = (cartId, type) => {
    if (type === "increase") {
      dispatch(increaseProductQuantity(cartId));
    } else if (type === "decrease") {
      dispatch(decreaseProductQuantity(cartId));
    }
  };

  // Calculate grand total price
  const grandTotal = cartItems.reduce(
    (acc, item) => acc + item.quantity * item?.product?.price,
    0
  );

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">Your Cart</h1>

      {/* Loading state */}
      {status === "pending" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="bg-white shadow-lg rounded-lg">
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
          ))}
        </div>
      )}

      {/* Error state */}
      {status === "rejected" && (
        <p className="text-center text-red-500">Failed to load cart items.</p>
      )}

      {/* Empty cart */}
      {status === "success" && cartItems.length === 0 && (
        <p className="text-center text-gray-600">Your cart is empty.</p>
      )}

      {/* Display cart items in a row */}
{status === "success" && cartItems.length > 0 && (
  <>
    <div className="flex flex-col gap-6">
      {cartItems.map((item) => (
        <Card key={item.id} className="bg-white shadow-lg rounded-lg flex flex-row w-full">
          {/* Product Image */}
          <CardHeader className="p-0 w-40">
            <img
              src={item.product.imageUrl || "/placeholder.jpg"}
              alt={item.product.name}
              className="w-full h-full object-cover rounded-l-lg"
            />
          </CardHeader>

          {/* Product Details */}
          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">{item.product.name}</CardTitle>
              <CardDescription className="text-gray-500 mb-2">
                {item.product.desc}
              </CardDescription>
              <p className="text-xl font-bold text-gray-900">KSH{item.product.price}</p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-3 mt-4">
              <Button
                variant="outline"
                className="p-2"
                onClick={() => handleUpdateQuantity(item.id, "decrease")}
                disabled={item.quantity === 1}
              >
                <Minus size={18} />
              </Button>
              <span className="text-lg font-semibold">{item.quantity}</span>
              <Button
                variant="outline"
                className="p-2"
                onClick={() => handleUpdateQuantity(item.id, "increase")}
              >
                <Plus size={18} />
              </Button>
            </div>

            <p className="text-lg font-semibold text-gray-700 mt-2">
              Total: KSH{(item?.quantity * item?.product?.price).toFixed(2)}
            </p>
          </CardContent>

          {/* Remove Button */}
          <CardFooter className="p-4 flex items-center">
            <Button
              className="bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center justify-center"
              onClick={() => handleRemoveItem(item.id)}
              disabled={loadingCartId === item.id}
            >
              {loadingCartId === item.id ? (
                "Removing..."
              ) : (
                <>
                  <Trash size={18} className="mr-2" /> Remove
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>

    {/* Grand Total & Checkout */}
    <div className="mt-8 p-4 bg-white shadow-md rounded-lg flex flex-col items-center">
      <h2 className="text-2xl font-bold">Grand Total: KSH{grandTotal.toFixed(2)}</h2>
      <Button className="mt-4 w-64 bg-blue-500 text-white hover:bg-blue-600" onClick={() => navigate("/shop/checkout")}>
        Proceed to Checkout
      </Button>
    </div>
  </>
)}

    </div>
  );
};

export default CartPage;
