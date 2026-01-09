/* eslint-disable react/prop-types */
import { AlignJustify, LogOut } from "lucide-react";
import { Button } from "../../ui/button";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/features/slices/authSlice";

function AdminHeader({ setOpen }) {
  const dispatch = useDispatch();

  const handleLogout = () =>{
    dispatch(logoutUser());
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <Button 
        onClick={() => setOpen(true)} 
        className="lg:hidden"
        variant="ghost"
        size="icon"
      >
        <AlignJustify className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      
      <div className="flex items-center gap-4">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="inline-flex gap-2 items-center px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
        
        {/* Optional: Add user avatar/dropdown here */}
        {/* <UserDropdown /> */}
      </div>
    </header>
  );
}

export default AdminHeader;