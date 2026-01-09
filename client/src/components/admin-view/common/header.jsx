/* eslint-disable react/prop-types */
import { AlignJustify, LogOut, User } from "lucide-react";
import { Button } from "../../ui/button";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/features/slices/authSlice";

function AdminHeader({ setOpen }) {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Left side - Menu toggle */}
      <div className="flex items-center gap-4">
        <Button 
          onClick={() => setOpen(true)} 
          className="lg:hidden"
          variant="ghost"
          size="icon"
        >
          <AlignJustify className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        
        {/* Optional: Add logo or title */}
        <div className="hidden md:block">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Admin Dashboard
          </h1>
        </div>
      </div>
      
      {/* Right side - User actions */}
      <div className="flex items-center gap-3">
        {/* Optional: Add user info */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Admin</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
          </div>
        </div>
        
        {/* Logout button */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="inline-flex gap-2 items-center px-4 py-2 text-sm font-medium transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-800"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}

export default AdminHeader;