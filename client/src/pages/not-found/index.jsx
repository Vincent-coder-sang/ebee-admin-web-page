/* eslint-disable react/no-unescaped-entities */
import { Link } from "react-router-dom";
import { Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming you're using shadcn/ui

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="inline-flex items-center justify-center p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
          <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
            Page Not Found
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Return to Dashboard
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link to="/admin" className="flex items-center gap-2">
              Go to Admin Home
            </Link>
          </Button>
        </div>

        <div className="pt-6 text-sm text-gray-400 dark:text-gray-500">
          <p>If you believe this is an error, please contact support.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;