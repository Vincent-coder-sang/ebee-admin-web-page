/* eslint-disable react/prop-types */
import { Route, Routes } from "react-router-dom";
import AuthLayout from "./components/auth/layout";
import AdminLayout from "./components/admin-view/common/layout";
import AdminDashboard from "./pages/admin-view/dashboard/dashboard";
import AdminProducts from "./pages/admin-view/products/admin-products";
import NotFound from "./pages/not-found";
import CheckAuth from "./components/common/check-auth";
import UnauthPage from "./pages/unauth-page";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import { loadUser } from "./features/slices/authSlice";
import ForgotPassword from "./pages/auth/forgot-password";
import AdminOrders from "./pages/admin-view/orders/admin-orders";
import AdminUsers from "./pages/admin-view/users/admin-users";
import AdminDispatch from "./pages/admin-view/dispatch/dispatch";
import AdminTechnicians from "./pages/admin-view/technicians/technicians";
import AdminRentals from "./pages/admin-view/rentals/rentals";
import AdminFeedback from "./pages/admin-view/feedback/feedback";
import AdminFines from "./pages/admin-view/fines/fines";
import AdminReports from "./pages/admin-view/reports/reports";
import AdminHelpAndSupport from "./pages/admin-view/helpAndSupport/help-and-support";
import AdminInventory from "./pages/admin-view/inventory/inventory";
import AdminPayments from "./pages/admin-view/payments/payments";
import ResetPassword from "./pages/auth/password-reset";
import AdminBookings from "./pages/admin-view/bookings/bookings";
import AdminServices from "./pages/admin-view/services/services";

const App = ({ isAuthenticated, user }) => {
  // Remove unused props
  const dispatch = useDispatch();
  const userLoaded = useSelector((state) => state.auth.userLoaded);

  console.log("User Loaded:", userLoaded);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  if (!userLoaded) {
    return (
      <div className="flex flex-col overflow-hidden bg-white min-h-screen">
        <Skeleton className="w-full h-screen bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden bg-white min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        {/* Protected Routes - WITH CheckAuth wrapper */}
        <Route
          path="/"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <div className="p-8">
                <h1 className="text-2xl font-bold">Welcome to EBee</h1>
                <p>Home page content goes here</p>
              </div>
            </CheckAuth>
          }
        />

        <Route
          path="/auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AuthLayout />
            </CheckAuth>
          }
        >
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route path="/auth/reset-password/:token" element={<ResetPassword />} />

        {/* admin pages */}
        <Route
          path="/admin/*" // Use /* to catch all admin sub-routes
          element={
            <CheckAuth
              isAuthenticated={isAuthenticated}
              user={user}
              requireAuth
              requireAdmin
            >
              <AdminLayout />
            </CheckAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="dispatch" element={<AdminDispatch />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="technician" element={<AdminTechnicians />} />
          <Route path="rentals" element={<AdminRentals />} />
          <Route path="feedbacks" element={<AdminFeedback />} />
          <Route path="fines" element={<AdminFines />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="help&support" element={<AdminHelpAndSupport />} />
        </Route>

        {/* Public Error Pages */}
        <Route path="/unauth-page" element={<UnauthPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
