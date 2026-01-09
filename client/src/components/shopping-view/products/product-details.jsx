import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProduct } from "@/features/slices/productSlice";
import { addProductToCart } from "@/features/slices/cartSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import StarRatingComponent from "../../common/star-rating";
import { addRating } from "@/features/slices/feedbackSlice";

const ProductDetails = () => {
  const { productId } = useParams(); // Get product ID from URL
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { list: product, status } = useSelector((state) => state.products || []);


  const { id: userId } = useSelector((state) => state.auth);
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      dispatch(fetchProduct(productId));
    }
  }, [dispatch, productId]);

  const handleAddToCart = async () => {
    if (!userId) {
      alert("Please login to add products to cart.");
      return;
    }
    setLoading(true);
    try {
      await dispatch(addProductToCart({ userId, productId })).unwrap();
      alert("Product added to cart!");
    } catch (error) {
      console.error("Failed to add product:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleAddReview = async () => {
    if (!userId) {
      alert("Please login to add a review.");
      return;
    }
    try {
      await dispatch(addRating({ userId, productId, message: reviewMsg, rating })).unwrap();
      setReviewMsg("");
      setRating(0);
    } catch (error) {
      console.error("Failed to add review:", error);
    }
  };
  

  if (status === "pending") return <p className="text-center ">Loading product...</p>;
  if (status === "rejected") return <p className="text-center">Failed to load product.</p>;

  return (
    <Dialog open={true} onOpenChange={() => navigate("/shop/home")}>
      <DialogContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div>
          <img
            src={product?.imageUrl || "/placeholder.jpg"}
            alt={product?.name}
            className="w-full object-cover rounded-lg h-48 md:h-96"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{product?.name}</h1>
          <p className="text-gray-600">{product?.description}</p>
          <p className="text-xl font-bold mt-2">Ksh {product?.price}</p>
          <div className="mt-3 flex items-center gap-2">
            <StarRatingComponent rating={product?.averageRating || 0} />
            <span className="text-gray-500">({product?.averageRating?.toFixed(2)})</span>
          </div>
          <Button
            className="mt-4 w-full bg-blue-500 text-white"
            onClick={handleAddToCart}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add to Cart"}
          </Button>
          <Separator className="my-4" />
          <h2 className="text-xl font-bold mb-3">Ratings</h2>
          <div className="max-h-64 overflow-auto">
            {product?.ratings?.length ? (
  product.ratings.map((review, index) => (
    <div key={index} className="border-b pb-3 mb-3">
      <p className="font-semibold">{review?.user?.name}</p>
      <StarRatingComponent rating={review.rating} />
      <p className="text-gray-600">{review.message}</p>
    </div>
  ))
) : (
  <p>No reviews yet.</p>
)}

          </div>
          <Separator className="my-4" />
          <h3 className="text-lg font-bold">Write a review</h3>
          <StarRatingComponent rating={rating} handleRatingChange={setRating} />
          <Input
            value={reviewMsg}
            onChange={(e) => setReviewMsg(e.target.value)}
            placeholder="Write your review..."
            className="mt-2"
          />
          <Button
            className="mt-2 w-full"
            onClick={handleAddReview}
            disabled={!reviewMsg.trim() || rating === 0}
          >
            Submit Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetails;