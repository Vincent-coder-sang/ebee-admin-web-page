/* eslint-disable react/prop-types */
import { Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { loadUser, logoutUser } from "@/features/slices/authSlice";
import { Spinner } from "@/components/ui/spinner";

const CheckAuth = ({ children, requireAuth = false, requireAdmin = false }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { userType, token, userLoaded } = useSelector((state) => state.auth);
  const isAuthenticated = Boolean(token);

  console.log("isAuthenticated", isAuthenticated);
  console.log("userType", userType);
  console.log("userLoaded", userLoaded);

  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem("token");
    
    if (tokenFromStorage) {
      try {
        const user = jwtDecode(tokenFromStorage);
        // Check if token is expired
        if (user.exp * 1000 < Date.now()) {
          console.log("Token expired, logging out");
          dispatch(logoutUser());
        } else {
          console.log("Token valid, loading user");
          dispatch(loadUser());
        }
      } catch (error) {
        console.error("Token decoding failed:", error);
        dispatch(logoutUser());
      }
    } else {
      // No token in storage, ensure clean state
      console.log("No token found in storage");
      setCheckingToken(false);
    }
    
    setCheckingToken(false);
  }, [dispatch]);

  // Show spinner only while checking token initially
  if (checkingToken) {
    return <Spinner />;
  }

  // Public paths that don't require authentication
  const publicPaths = [
    "/auth/login",
    "/auth/register", 
    "/auth/forgot-password",
    "/auth/reset-password"
  ];

  // Check if current path is public
  const isPublicPath = publicPaths.some(path => 
    location.pathname.startsWith(path)
  );

  // Check if current path is reset password
  const isResetPasswordPath = location.pathname.startsWith("/auth/reset-password");

  // 1. Handle reset password path specially (always allow)
  if (isResetPasswordPath) {
    return children;
  }

  // 2. If user is authenticated and tries to access public path, redirect to appropriate dashboard
  if (isAuthenticated && isPublicPath) {
    const redirectPath = userType === "admin" ? "/admin/dashboard" : "/user/dashboard";
    console.log("Authenticated user accessing public path, redirecting to:", redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  // 3. If auth is required but user isn't authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    console.log("Authentication required, redirecting to login");
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 4. If admin role is required but user isn't admin
  if (requireAuth && requireAdmin && userType !== "admin") {
    console.log("Admin access required, redirecting to unauthorized page");
    return <Navigate to="/unauth-page" replace />;
  }

  // 5. Handle root path redirect
  if (location.pathname === "/") {
    if (isAuthenticated) {
      const redirectPath = userType === "admin" ? "/admin/dashboard" : "/user/dashboard";
      console.log("Root path access, redirecting to:", redirectPath);
      return <Navigate to={redirectPath} replace />;
    }
    console.log("Root path access, redirecting to login");
    return <Navigate to="/auth/login" replace />;
  }

  console.log("Rendering children for path:", location.pathname);
  return children;
};

export default CheckAuth;