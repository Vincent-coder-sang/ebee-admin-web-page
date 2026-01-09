import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button } from "@/components/ui/button"; // Adjust this import as needed
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"; // Adjust this import as needed

const VerifyCode = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Handle verification code is being callled")
    
    try {
      const response = await axios.post('http://localhost:3001/api/auth/verify/:verificationCode', { verificationCode });
      toast.success("Verification successful!");
      
      // Redirect user to the reset password page
      window.location.href = '/reset-password'; // Adjust this path as necessary
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Enter Verification Code</h2>
        
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          
          <Button type="submit" disabled={loading} className="w-full mt-4">
            {loading ? 'Verifying...' : 'Verify Code'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VerifyCode;
