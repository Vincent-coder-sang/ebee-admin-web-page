import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button } from "@/components/ui/button"; // Adjust this import to match your project structure

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("handle forgot password has been called")
    try {
      const response = await axios.post('http://localhost:3001/api/auth/forgot-password', { email });
      toast.success("Reset code sent to your email!");
      console.log("Forgot password response is", response)
      // Redirect user to the verify code page after successfully sending the email
      window.location.href = '/auth/verify-code'; // Adjust this path as necessary
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset code!");
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        
        <form onSubmit={handleForgotPassword}>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="mt-2 p-2 border border-gray-300 rounded w-full"
            required
          />
          
          <Button type="submit" disabled={loading} className="w-full mt-4">
            {loading ? 'Sending...' : 'Send Reset Code'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
