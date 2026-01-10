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
  AlertTriangle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0" />,
    category: "dashboard"
  },
  {
    id: "reports",
    label: "Reports & Analytics",
    path: "/admin/reports",
    icon: <BarChart3 className="h-5 w-5 flex-shrink-0" />,
    category: "reports",
    submenu: [
      {
        id: "reports-overview",
        label: "Overview",
        path: "/admin/reports",
      },
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
        label: "Order Analytics",
        path: "/admin/reports/orders",
      }
      // Removed: Custom Reports
    ]
  },
  {
    id: "products",
    label: "Products",
    path: "/admin/products",
    icon: <Package className="h-5 w-5 flex-shrink-0" />,
    category: "management"
  },
  {
    id: "orders",
    label: "Orders",
    path: "/admin/orders",
    icon: <ShoppingCart className="h-5 w-5 flex-shrink-0" />,
    category: "management"
  },
  {
    id: "users",
    label: "Users",
    path: "/admin/users",
    icon: <Users className="h-5 w-5 flex-shrink-0" />,
    category: "management"
  },
  {
    id: "bookings",
    label: "Bookings",
    path: "/admin/bookings",
    icon: <FolderKanban className="h-5 w-5 flex-shrink-0" />,
    category: "management"
  },
   {
    id: "rentals",
    label: "Rentals",
    path: "/admin/rentals",
    icon: <FolderKanban className="h-5 w-5 flex-shrink-0" />,
    category: "management"
  },
   {
    id: "dispatch",
    label: "Dispatch",
    path: "/admin/dispatch",
    icon: <FolderKanban className="h-5 w-5 flex-shrink-0" />,
    category: "management"
  },
  {
    id: "services",
    label: "Services",
    path: "/admin/services",
    icon: <Wrench className="h-5 w-5 flex-shrink-0" />,
    category: "management"
  },
  // Add this to your menuItems array, in the 'management' section:
{
  id: "fines",
  label: "Fines Management",
  path: "/admin/fines",
  icon: <AlertTriangle className="h-5 w-5 flex-shrink-0" />, // You'll need to import AlertTriangle
  category: "management"
},
  {
    id: "payments",
    label: "Payments",
    path: "/admin/payments",
    icon: <CreditCard className="h-5 w-5 flex-shrink-0" />,
    category: "management"
  },
  {
    id: "sales",
    label: "Sales",
    path: "/admin/sales",
    icon: <DollarSign className="h-5 w-5 flex-shrink-0" />,
    category: "management"
  },
  {
    id: "feedback",
    label: "Feedback",
    path: "/admin/feedback",
    icon: <MessageSquare className="h-5 w-5 flex-shrink-0" />,
    category: "management"
  },
  {
    id: "help-support",
    label: "Help & Support",
    path: "/admin/help-support",
    icon: <HelpCircle className="h-5 w-5 flex-shrink-0" />,
    category: "management"
  }
];

const AdminSideBar = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-expand menu if current path matches any submenu item
  useEffect(() => {
    const expanded = {};
    menuItems.forEach(item => {
      if (item.submenu) {
        const hasActiveChild = item.submenu.some(subItem => 
          location.pathname === subItem.path
        );
        if (hasActiveChild) {
          expanded[item.id] = true;
        }
      }
    });
    setExpandedMenus(expanded);
  }, [location.pathname]);

  const toggleSubmenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const MenuItem = ({ item, mobile = false, collapsed = false }) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedMenus[item.id];
    const isActive = location.pathname === item.path || 
                    (hasSubmenu && item.submenu.some(subItem => 
                      location.pathname === subItem.path));

    if (collapsed && !mobile) {
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (hasSubmenu) {
              toggleSubmenu(item.id);
            } else {
              navigate(item.path);
            }
          }}
          className={cn(
            "w-12 h-12 mx-auto mb-2 relative group",
            isActive && "bg-blue-100 text-blue-600",
            !isActive && "hover:bg-gray-100"
          )}
          title={item.label}
        >
          {item.icon}
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r"></div>
          )}
          {/* Tooltip for collapsed state */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            {item.label}
          </div>
        </Button>
      );
    }

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
          className={cn(
            "w-full flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition-all",
            isActive 
              ? "bg-blue-100 text-blue-700 border border-blue-200" 
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "flex-shrink-0",
              isActive && "text-blue-600"
            )}>
              {item.icon}
            </div>
            <span className="truncate">{item.label}</span>
          </div>
          {hasSubmenu && (
            <ChevronDown className={cn(
              "h-4 w-4 flex-shrink-0 transition-transform duration-200",
              isExpanded ? "rotate-180" : "",
              isActive && "text-blue-600"
            )} />
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
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all min-w-0",
                    isSubActive
                      ? "bg-blue-50 text-blue-600 border border-blue-100"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  )}
                >
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full flex-shrink-0",
                    isSubActive ? "bg-blue-500" : "bg-gray-400 opacity-60"
                  )} />
                  <span className="truncate">{subItem.label}</span>
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

  const MenuContent = ({ mobile = false, collapsed = false }) => (
    <nav className={cn(
      "space-y-6 p-4 h-full overflow-y-auto",
      collapsed && "p-2"
    )}>
      {/* Dashboard Section */}
      {!collapsed && (
        <div>
          <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
            Dashboard
          </h3>
          {menuByCategory.dashboard.map((item) => (
            <MenuItem key={item.id} item={item} mobile={mobile} collapsed={collapsed} />
          ))}
        </div>
      )}

      {/* Reports Section */}
      {!collapsed && menuByCategory.reports.length > 0 && (
        <div>
          <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
            Reports & Analytics
          </h3>
          {menuByCategory.reports.map((item) => (
            <MenuItem key={item.id} item={item} mobile={mobile} collapsed={collapsed} />
          ))}
        </div>
      )}

      {/* Management Section */}
      {!collapsed ? (
        <div>
          <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
            Management
          </h3>
          <div className="space-y-1">
            {menuByCategory.management.map((item) => (
              <MenuItem key={item.id} item={item} mobile={mobile} collapsed={collapsed} />
            ))}
          </div>
        </div>
      ) : (
        // Collapsed view - show icons only
        <div className="space-y-1">
          {menuItems.map((item) => (
            <MenuItem key={item.id} item={item} mobile={mobile} collapsed={collapsed} />
          ))}
        </div>
      )}
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
        <SheetContent side="left" className="w-72 p-0 sm:w-80">
          <SheetHeader className="border-b p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200">
                <LayoutDashboard className="h-6 w-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-800 truncate">Admin Panel</h1>
                <p className="text-xs text-gray-500 truncate">Dashboard</p>
              </div>
            </div>
          </SheetHeader>
          <div className="h-[calc(100vh-80px)] overflow-y-auto">
            <MenuContent mobile={true} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar with toggle */}
      <aside className={cn(
        "hidden lg:flex flex-col border-r bg-white h-screen sticky top-0 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Header */}
        <div 
          onClick={() => navigate("/admin/dashboard")} 
          className={cn(
            "flex cursor-pointer items-center p-4 border-b hover:bg-gray-50 transition-colors",
            isCollapsed ? "justify-center" : "gap-3"
          )}
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-800 truncate">Admin Panel</h1>
              <p className="text-xs text-gray-500 truncate">Dashboard</p>
            </div>
          )}
          
          {/* Toggle Button */}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 ml-auto"
              title="Collapse sidebar"
            >
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform duration-200",
                isCollapsed ? "rotate-0" : "rotate-90"
              )} />
            </Button>
          )}
        </div>

        {/* Menu Content */}
        <div className="flex-1 overflow-y-auto">
          <MenuContent collapsed={isCollapsed} />
        </div>

        {/* Collapsed mode toggle button */}
        {isCollapsed && (
          <div className="border-t p-4 mt-auto">
            <div className="flex flex-col items-center space-y-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(false)}
                className="h-10 w-10"
                title="Expand sidebar"
              >
                <ChevronDown className="h-5 w-5 rotate-90" />
              </Button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default AdminSideBar;