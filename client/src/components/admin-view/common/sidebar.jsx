/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  Menu,
  X,
  FileText,
  Link,
  Wrench,
  MessageSquare,
  HelpCircle,
  BarChart3
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    id: "reports",
    label: "Reports",
    path: "/admin/reports",
    icon: <BarChart3 className="h-5 w-5" />,
    submenu: [
      {
        id: "purchase-orders",
        label: "Purchase Orders",
        path: "/admin/reports/purchase-orders",
      },
      {
        id: "service-bookings",
        label: "Service Bookings",
        path: "/admin/reports/service-bookings",
      },
      {
        id: "order-reports",
        label: "Order Reports",
        path: "/admin/reports/orders",
      }
    ]
  },
  {
    id: "products",
    label: "Products",
    path: "/admin/products",
    icon: <Package className="h-5 w-5" />,
  },
  {
    id: "orders",
    label: "Orders",
    path: "/admin/orders",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    id: "users",
    label: "Users",
    path: "/admin/users",
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: "links",
    label: "Quick Links",
    path: "#",
    icon: <Link className="h-5 w-5" />,
    submenu: [
      {
        id: "services",
        label: "Services",
        path: "/admin/services",
      },
      {
        id: "sales",
        label: "Sales",
        path: "/admin/sales",
      },
      {
        id: "feedback",
        label: "Feedback",
        path: "/admin/feedback",
      },
      {
        id: "help-support",
        label: "Help & Support",
        path: "/admin/help-support",
      }
    ]
  },
  {
    id: "settings",
    label: "Settings",
    path: "/admin/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

const AdminSideBar = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleSubmenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const MenuItem = ({ item, mobile = false }) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedMenus[item.id];
    const isActive = location.pathname === item.path || 
                    (hasSubmenu && item.submenu.some(subItem => 
                      location.pathname === subItem.path));

    return (
      <div className="space-y-1">
        <button
          onClick={() => {
            if (hasSubmenu) {
              toggleSubmenu(item.id);
            } else {
              navigate(item.path);
              if (mobile) setOpen(false);
            }
          }}
          className={`w-full flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition-all ${
            isActive
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span>{item.label}</span>
          </div>
          {hasSubmenu && (
            <svg
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {hasSubmenu && isExpanded && (
          <div className="ml-6 space-y-1">
            {item.submenu.map((subItem) => (
              <button
                key={subItem.id}
                onClick={() => {
                  navigate(subItem.path);
                  if (mobile) setOpen(false);
                }}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                  location.pathname === subItem.path
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                <span>{subItem.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const MenuContent = ({ mobile = false }) => (
    <nav className="space-y-1 p-4">
      {menuItems.map((item) => (
        <MenuItem key={item.id} item={item} mobile={mobile} />
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <LayoutDashboard className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">Admin</h1>
            </div>
          </SheetHeader>
          <MenuContent mobile={true} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-white h-screen sticky top-0">
        <div 
          onClick={() => navigate("/admin/dashboard")} 
          className="flex cursor-pointer items-center gap-3 p-6 border-b hover:bg-gray-50 transition-colors"
        >
          <div className="p-2 rounded-lg bg-blue-100">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        <MenuContent />
      </aside>
    </>
  );
};

export default AdminSideBar;