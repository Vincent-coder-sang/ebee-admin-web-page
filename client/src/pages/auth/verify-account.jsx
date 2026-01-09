import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Ensure axios is imported
import { toast } from "react-toastify";
import { url } from "@/features/slices/api"; // Adjust the import path based on your setup
import { motion } from "framer-motion";

const VerifyAccount = () => {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const inputRefs = useRef([]);

    // Handle input changes (typing or pasting)
    const handleChange = (index, value) => {
        const newCode = [...code];

        // Handle multi-character pasted content
        if (value.length > 1) {
            const pastedCode = value.slice(0, 6).split("");
            for (let i = 0; i < 6; i++) {
                newCode[i] = pastedCode[i] || "";
            }
            setCode(newCode);

            // Focus on the last non-empty input or the first empty one
            const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
            const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
            inputRefs.current[focusIndex]?.focus();
        } else {
            newCode[index] = value;
            setCode(newCode);

            // Move focus to the next input field if value is entered
            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    // Handle key events, specifically for backspace
    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle form submission
    const handleVerification = async (e) => {
        e.preventDefault();
        setLoading(true);
        const verificationCode = code.join(""); // Join the array into a string for submission

        try {
            const response = await axios.post(`${url}/auth/verify-account`, { verificationCode });
            toast.success(response.data.message, {
                position: "top-center",
            });

            // Redirect to login page on success
            navigate("/auth/login");
        } catch (error) {
            console.error("Verification failed", error);  // Log the error for debugging
            toast.error(error.response?.data?.message || "Verification failed", {
                position: "top-center",
            });
        } finally {
            setLoading(false);
        }
    };

    // Auto submit when all fields are filled
    useEffect(() => {
        if (code.every((digit) => digit !== "")) {
            handleVerification({ preventDefault: () => {} }); // Auto submit when code is complete
        }
    }, [code]);

    return (
        <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}

        className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                    Verify Your Email
                </h2>
                <p className="text-center text-gray-300 mb-6">Enter the 6-digit code sent to your email address.</p>

                <form onSubmit={handleVerification} className="space-y-6">
                    <div className="flex justify-between">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-12 text-center text-2xl font-bold bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-green-500 focus:outline-none"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || code.some((digit) => !digit)} // Disable submit if any field is empty
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
                    >
                        {loading ? "Verifying..." : "Verify Email"}
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

export default VerifyAccount;
