/* eslint-disable react/prop-types */
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Wrench,
  MessageSquare,
  HelpCircle,
  BarChart3,
  CreditCard,
  DollarSign,
  Menu,
  X,
  FolderKanban,
  ChevronDown,
  Plus,
  List,
  Settings,
  Archive,
  UserPlus,
  Ban,
  Clock,
  CheckCircle,
  TrendingUp,
  FileText,
  Shield,
  Bell,
  Mail
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
    category: "dashboard"
  },
  {
    id: "reports",
    label: "Reports & Analytics",
    path: "/admin/reports",
    icon: <BarChart3 className="h-5 w-5" />,
    category: "reports",
    submenu: [
      {
        id: "reports-overview",
        label: "Overview",
        path: "/admin/reports",
        icon: <TrendingUp className="h-4 w-4" />
      },
      {
        id: "purchase-orders",
        label: "Purchase Orders",
        path: "/admin/reports/purchase-orders",
        icon: <ShoppingCart className="h-4 w-4" />
      },
      {
        id: "service-bookings",
        label: "Service Bookings",
        path: "/admin/reports/service-bookings",
        icon: <FolderKanban className="h-4 w-4" />
      },
      {
        id: "order-reports",
        label: "Order Analytics",
        path: "/admin/reports/orders",
        icon: <BarChart3 className="h-4 w-4" />
      },
      {
        id: "custom-reports",
        label: "Custom Reports",
        path: "/admin/reports/custom",
        icon: <FileText className="h-4 w-4" />
      }
    ]
  },
  {
    id: "products",
    label: "Products",
    path: "/admin/products",
    icon: <Package className="h-5 w-5" />,
    category: "management",
    submenu: [
      {
        id: "all-products",
        label: "All Products",
        path: "/admin/products",
        icon: <List className="h-4 w-4" />
      },
      {
        id: "add-product",
        label: "Add New Product",
        path: "/admin/products/add",
        icon: <Plus className="h-4 w-4" />
      },
      {
        id: "categories",
        label: "Categories",
        path: "/admin/products/categories",
        icon: <Archive className="h-4 w-4" />
      },
      {
        id: "inventory",
        label: "Inventory",
        path: "/admin/products/inventory",
        icon: <Package className="h-4 w-4" />
      }
    ]
  },
  {
    id: "orders",
    label: "Orders",
    path: "/admin/orders",
    icon: <ShoppingCart className="h-5 w-5" />,
    category: "management",
    submenu: [
      {
        id: "all-orders",
        label: "All Orders",
        path: "/admin/orders",
        icon: <List className="h-4 w-4" />
      },
      {
        id: "pending-orders",
        label: "Pending Orders",
        path: "/admin/orders/pending",
        icon: <Clock className="h-4 w-4" />
      },
      {
        id: "completed-orders",
        label: "Completed Orders",
        path: "/admin/orders/completed",
        icon: <CheckCircle className="h-4 w-4" />
      },
      {
        id: "cancelled-orders",
        label: "Cancelled Orders",
        path: "/admin/orders/cancelled",
        icon: <Ban className="h-4 w-4" />
      }
    ]
  },
  {
    id: "users",
    label: "Users",
    path: "/admin/users",
    icon: <Users className="h-5 w-5" />,
    category: "management",
    submenu: [
      {
        id: "all-users",
        label: "All Users",
        path: "/admin/users",
        icon: <List className="h-4 w-4" />
      },
      {
        id: "add-user",
        label: "Add New User",
        path: "/admin/users/add",
        icon: <UserPlus className="h-4 w-4" />
      },
      {
        id: "user-roles",
        label: "User Roles",
        path: "/admin/users/roles",
        icon: <Shield className="h-4 w-4" />
      },
      {
        id: "user-activity",
        label: "User Activity",
        path: "/admin/users/activity",
        icon: <Clock className="h-4 w-4" />
      }
    ]
  },
  {
    id: "bookings",
    label: "Bookings",
    path: "/admin/bookings",
    icon: <FolderKanban className="h-5 w-5" />,
    category: "management",
    submenu: [
      {
        id: "all-bookings",
        label: "All Bookings",
        path: "/admin/bookings",
        icon: <List className="h-4 w-4" />
      },
      {
        id: "pending-bookings",
        label: "Pending Bookings",
        path: "/admin/bookings/pending",
        icon: <Clock className="h-4 w-4" />
      },
      {
        id: "confirmed-bookings",
        label: "Confirmed Bookings",
        path: "/admin/bookings/confirmed",
        icon: <CheckCircle className="h-4 w-4" />
      },
      {
        id: "cancelled-bookings",
        label: "Cancelled Bookings",
        path: "/admin/bookings/cancelled",
        icon: <Ban className="h-4 w-4" />
      }
    ]
  },
  {
    id: "services",
    label: "Services",
    path: "/admin/services",
    icon: <Wrench className="h-5 w-5" />,
    category: "management",
    submenu: [
      {
        id: "all-services",
        label: "All Services",
        path: "/admin/services",
        icon: <List className="h-4 w-4" />
      },
      {
        id: "add-service",
        label: "Add New Service",
        path: "/admin/services/add",
        icon: <Plus className="h-4 w-4" />
      },
      {
        id: "service-categories",
        label: "Service Categories",
        path: "/admin/services/categories",
        icon: <Archive className="h-4 w-4" />
      },
      {
        id: "service-providers",
        label: "Service Providers",
        path: "/admin/services/providers",
        icon: <Users className="h-4 w-4" />
      }
    ]
  },
  {
    id: "payments",
    label: "Payments",
    path: "/admin/payments",
    icon: <CreditCard className="h-5 w-5" />,
    category: "management",
    submenu: [
      {
        id: "all-payments",
        label: "All Payments",
        path: "/admin/payments",
        icon: <List className="h-4 w-4" />
      },
      {
        id: "pending-payments",
        label: "Pending Payments",
        path: "/admin/payments/pending",
        icon: <Clock className="h-4 w-4" />
      },
      {
        id: "completed-payments",
        label: "Completed Payments",
        path: "/admin/payments/completed",
        icon: <CheckCircle className="h-4 w-4" />
      },
      {
        id: "failed-payments",
        label: "Failed Payments",
        path: "/admin/payments/failed",
        icon: <Ban className="h-4 w-4" />
      }
    ]
  },
  {
    id: "sales",
    label: "Sales",
    path: "/admin/sales",
    icon: <DollarSign className="h-5 w-5" />,
    category: "management",
    submenu: [
      {
        id: "sales-overview",
        label: "Overview",
        path: "/admin/sales",
        icon: <TrendingUp className="h-4 w-4" />
      },
      {
        id: "sales-by-product",
        label: "Sales by Product",
        path: "/admin/sales/products",
        icon: <Package className="h-4 w-4" />
      },
      {
        id: "sales-by-service",
        label: "Sales by Service",
        path: "/admin/sales/services",
        icon: <Wrench className="h-4 w-4" />
      },
      {
        id: "sales-reports",
        label: "Sales Reports",
        path: "/admin/sales/reports",
        icon: <FileText className="h-4 w-4" />
      }
    ]
  },
  {
    id: "feedback",
    label: "Feedback",
    path: "/admin/feedback",
    icon: <MessageSquare className="h-5 w-5" />,
    category: "management",
    submenu: [
      {
        id: "all-feedback",
        label: "All Feedback",
        path: "/admin/feedback",
        icon: <List className="h-4 w-4" />
      },
      {
        id: "unread-feedback",
        label: "Unread Feedback",
        path: "/admin/feedback/unread",
        icon: <Bell className="h-4 w-4" />
      },
      {
        id: "responded-feedback",
        label: "Responded",
        path: "/admin/feedback/responded",
        icon: <MessageSquare className="h-4 w-4" />
      }
    ]
  },
  {
    id: "help-support",
    label: "Help & Support",
    path: "/admin/help-support",
    icon: <HelpCircle className="h-5 w-5" />,
    category: "management",
    submenu: [
      {
        id: "help-center",
        label: "Help Center",
        path: "/admin/help-center",
        icon: <HelpCircle className="h-4 w-4" />
      },
      {
        id: "support-tickets",
        label: "Support Tickets",
        path: "/admin/support/tickets",
        icon: <Mail className="h-4 w-4" />
      },
      {
        id: "faq",
        label: "FAQ",
        path: "/admin/faq",
        icon: <FileText className="h-4 w-4" />
      },
      {
        id: "documentation",
        label: "Documentation",
        path: "/admin/documentation",
        icon: <FileText className="h-4 w-4" />
      }
    ]
  }
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

  // Auto-expand menu if current path matches any submenu item
  const isPathInSubmenu = (submenu, currentPath) => {
    return submenu?.some(item => item.path === currentPath);
  };

  const MenuItem = ({ item, mobile = false }) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isActive = location.pathname === item.path || 
                    (hasSubmenu && isPathInSubmenu(item.submenu, location.pathname));
    const isExpanded = expandedMenus[item.id] || 
                      (hasSubmenu && isPathInSubmenu(item.submenu, location.pathname));

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
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          )}
        </button>

        {hasSubmenu && isExpanded && (
          <div className="ml-6 space-y-1">
            {item.submenu.map((subItem) => {
              const isSubActive = location.pathname === subItem.path;
              
              return (
                <button
                  key={subItem.id}
                  onClick={() => {
                    navigate(subItem.path);
                    if (mobile) setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                    isSubActive
                      ? "bg-blue-50 text-blue-600 border border-blue-100"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    isSubActive ? "bg-blue-500" : "bg-gray-400 opacity-60"
                  }`} />
                  {subItem.icon && (
                    <div className={`${isSubActive ? "text-blue-500" : "text-gray-400"}`}>
                      {subItem.icon}
                    </div>
                  )}
                  <span className="flex-1 text-left">{subItem.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Group menu items by category
  const menuByCategory = {
    dashboard: menuItems.filter(item => item.category === 'dashboard'),
    reports: menuItems.filter(item => item.category === 'reports'),
    management: menuItems.filter(item => item.category === 'management')
  };

  const MenuContent = ({ mobile = false }) => (
    <nav className="space-y-6 p-4 overflow-y-auto h-full">
      {/* Dashboard Section */}
      <div>
        <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Dashboard
        </h3>
        {menuByCategory.dashboard.map((item) => (
          <MenuItem key={item.id} item={item} mobile={mobile} />
        ))}
      </div>

      {/* Reports Section */}
      <div>
        <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Reports & Analytics
        </h3>
        {menuByCategory.reports.map((item) => (
          <MenuItem key={item.id} item={item} mobile={mobile} />
        ))}
      </div>

      {/* Management Section */}
      <div>
        <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Management
        </h3>
        <div className="space-y-1">
          {menuByCategory.management.map((item) => (
            <MenuItem key={item.id} item={item} mobile={mobile} />
          ))}
        </div>
      </div>

      {/* Settings Section (Optional) */}
      <div className="pt-6 border-t">
        <div className="px-3 mb-2">
          <button
            onClick={() => navigate("/admin/settings")}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all ${
              location.pathname === "/admin/settings"
                ? "bg-gray-100 text-gray-900 border border-gray-200"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md hover:bg-gray-100"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0 sm:w-72">
          <SheetHeader className="border-b p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <LayoutDashboard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            </div>
          </SheetHeader>
          <MenuContent mobile={true} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-white h-screen sticky top-0">
        <div 
          onClick={() => navigate("/admin/dashboard")} 
          className="flex cursor-pointer items-center gap-3 p-4 border-b hover:bg-gray-50 transition-colors"
        >
          <div className="p-2 rounded-lg bg-blue-100">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Admin Panel</h1>
            <p className="text-xs text-gray-500">Dashboard</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <MenuContent />
        </div>
        
        {/* User Profile (Optional) */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">Administrator</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate("/admin/profile")}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSideBar;