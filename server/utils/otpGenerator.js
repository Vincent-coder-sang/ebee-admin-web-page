// Function to generate OTP (One Time Password)
const generateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);

  return otp.toString().substring(0, 6);  // Ensure the OTP is 6 digits
};

module.exports = generateOtp;
