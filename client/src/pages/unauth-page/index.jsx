/* eslint-disable no-unused-vars */
import { ShieldAlert, Home, LogOut, ArrowLeft, Lock, User, Phone, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

function UnauthPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    
    // Redirect to login page
    navigate("/login");
  };

  const handleGoToHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-red-100">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-red-100 rounded-full">
              <ShieldAlert className="h-16 w-16 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Admin Access Required
          </CardTitle>
          <p className="text-gray-600 mt-2">
            This page is restricted to administrators only
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-gray-700 text-center">
              You need <span className="font-bold text-red-600">administrator privileges</span> to access this area of the system.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Admin Access Only
              </h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• This section is for system administrators only</li>
                <li>• Contact your system administrator for access</li>
                <li>• Ensure you're logged in with admin credentials</li>
                <li>• User accounts cannot access admin features</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Admin Features Include:
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Manage users and permissions</li>
                <li>• Configure system settings</li>
                <li>• View all system data</li>
                <li>• Generate reports and analytics</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleGoToHome}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Homepage
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
            
            <Button
              onClick={() => navigate("/login")}
              variant="ghost"
              className="w-full text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <User className="mr-2 h-4 w-4" />
              Sign in with Admin Account
            </Button>
          </div>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need administrator access?{" "}
              <button
                onClick={() => navigate("/contact")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Contact System Administrator
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UnauthPage;