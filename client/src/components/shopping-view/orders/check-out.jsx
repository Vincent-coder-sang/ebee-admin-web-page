import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { fetchusersAddress } from "@/features/slices/userAddressSlice";
import { createOrder } from "@/features/slices/orderSlice";


const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get data from Redux
  const cartItems = useSelector((state) => state.cart?.list || []);
  const userId = useSelector((state) => state.auth?.id);
  const userAddresses = useSelector((state) => state.usersAddress?.list || []);

  // Component State
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: "",
    phoneNumber: "",
    streetAddress: "",
    city: "",
  });

  // Load user addresses on component mount
  useEffect(() => {
    dispatch(fetchusersAddress());
  }, [dispatch]);

  // Auto-fill address if user has a saved address
  useEffect(() => {
    if (userAddresses.length > 0) {
      setAddress(userAddresses[0]); // Pre-fill with the first saved address
    }
  }, [userAddresses]);

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.quantity * item.product.price,
    0
  );

  const handleInputChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    if (!address.fullName || !address.phoneNumber || !address.streetAddress || !address.city) {
      toast.error("Please fill in all address details.");
      return;
    }

    setLoading(true);

    const orderData = {
      userId,
      items: cartItems,
      total: totalPrice,
      paymentMethod,
      address,
    };

    try {
      await dispatch(createOrder(orderData)).unwrap();
      setLoading(false);
      toast.success("Order placed successfully!");
      navigate("/shop/payment"); // Redirect to payment page
    } catch (error) {
      setLoading(false);
      toast.error("Order failed. Please try again.");
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100 flex flex-col items-center">
      <Card className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Checkout</CardTitle>
        </CardHeader>
        <CardContent>
          
          {/* Address Form */}
          <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
          <Input name="fullName" placeholder="Full Name" value={address.fullName} onChange={handleInputChange} className="mb-2" />
          <Input name="phoneNumber" placeholder="Phone Number" value={address.phoneNumber} onChange={handleInputChange} className="mb-2" />
          <Input name="streetAddress" placeholder="Street Address" value={address.streetAddress} onChange={handleInputChange} className="mb-2" />
          <Input name="city" placeholder="City" value={address.city} onChange={handleInputChange} className="mb-4" />

          {/* Order Summary */}
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <ul>
            {cartItems.map((item) => (
              <li key={item.id} className="flex justify-between py-2 border-b">
                <span>{item.product.name} (x{item.quantity})</span>
                <span>KSH {item.quantity * item.product.price}</span>
              </li>
            ))}
          </ul>
          <h3 className="text-xl font-bold mt-4">Total: KSH {totalPrice.toFixed(2)}</h3>

          {/* Payment Method */}
          <h2 className="text-lg font-semibold mt-6">Select Payment Method</h2>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="mpesa" /> M-Pesa
            </label>
          </RadioGroup>

          <Button className="mt-6 w-full bg-blue-500 text-white" onClick={handlePayment} disabled={loading}>
            {loading ? "Processing..." : "Place Order"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutPage;
