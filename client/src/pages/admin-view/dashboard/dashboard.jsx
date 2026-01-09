/* eslint-disable react/no-unescaped-entities */
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Wrench,
  Calendar,
  Clock,
  Eye,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Redux Thunks
import { fetchOrders } from "@/features/slices/orderSlice";
import { fetchProducts } from "@/features/slices/productSlice";
import { fetchUsers } from "@/features/slices/usersSlice";
import { fetchServices } from "@/features/slices/serviceSlice";

const AdminDashboard = () => {
  const dispatch = useDispatch();

  // Enhanced selectors with error handling
  const { 
    list: products = [], 
    loading: productsLoading,
    error: productsError 
  } = useSelector((state) => state.products);
  
  const { 
    list: orders = [], 
    loading: ordersLoading,
    error: ordersError 
  } = useSelector((state) => state.orders);
  
  const { 
    list: users = [], 
    loading: usersLoading,
    error: usersError 
  } = useSelector((state) => state.users);
  
  const { 
    list: services = [], 
    loading: servicesLoading,
    error: servicesError 
  } = useSelector((state) => state.services);
  
  // Combined loading state
  const isLoading = productsLoading || ordersLoading || usersLoading || servicesLoading;
  
  // Combined error state
  const hasError = productsError || ordersError || usersError || servicesError;

  useEffect(() => {
    // Fetch data on component mount
    dispatch(fetchProducts());
    dispatch(fetchOrders());
    dispatch(fetchUsers());
    dispatch(fetchServices());
  }, [dispatch]);

  // Handle refresh with loading states
  const handleRefresh = () => {
    dispatch(fetchProducts());
    dispatch(fetchOrders());
    dispatch(fetchUsers());
    dispatch(fetchServices());
  };

  // Calculate revenue from orders with validation
  const calculateRevenue = () => {
    if (!orders || orders.length === 0) return 0;
    return orders.reduce((sum, order) => {
      const price = parseFloat(order.totalPrice) || 0;
      return sum + price;
    }, 0);
  };

  // Calculate average order value with validation
  const calculateAverageOrderValue = () => {
    if (!orders || orders.length === 0) return 0;
    const revenue = calculateRevenue();
    return revenue / orders.length;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format KES currency
  const formatKES = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Stats data including services
  const stats = [
    {
      title: "Total Users",
      value: users?.length || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Registered users",
      loading: usersLoading
    },
    {
      title: "Total Products",
      value: products?.length || 0,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Available products",
      loading: productsLoading
    },
    {
      title: "Total Services",
      value: services?.length || 0,
      icon: Wrench,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Active services",
      loading: servicesLoading
    },
    {
      title: "Total Orders",
      value: orders?.length || 0,
      icon: ShoppingCart,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      description: "All-time orders",
      loading: ordersLoading
    },
    {
      title: "Total Revenue",
      value: formatCurrency(calculateRevenue()),
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      description: "Gross revenue",
      loading: ordersLoading
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(calculateAverageOrderValue()),
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      description: "Average per order",
      loading: ordersLoading
    }
  ];

  // Recent orders (last 5)
  const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : [];

  // Recent services (last 3)
  const recentServices = Array.isArray(services) ? services.slice(0, 3) : [];

  // Get user status badge
  const getUserStatusBadge = (user) => {
    if (!user) return null;
    
    return (
      <Badge 
        variant="outline" 
        className={`text-xs px-2 py-1 ${
          user.isApproved 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
        }`}
      >
        <span className="flex items-center gap-1">
          {user.isApproved ? (
            <>
              <CheckCircle className="w-3 h-3" />
              Approved
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3" />
              Pending
            </>
          )}
        </span>
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-32" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card key={item}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-4 w-24 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-4">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
              <p className="text-gray-600 mb-4">There was an issue fetching dashboard data.</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-gray-600 text-sm sm:text-base">Welcome to your admin dashboard</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fetch latest data from server</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Stats Grid - Responsive columns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 truncate">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor} flex-shrink-0`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 truncate">
                {stat.loading ? '...' : stat.value}
              </div>
              <p className="text-xs text-gray-500 truncate">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base sm:text-lg">Recent Orders</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs sm:text-sm"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-4 sm:py-8 text-gray-500">
                <ShoppingCart className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-gray-300" />
                <p className="text-sm sm:text-base">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 border rounded-lg hover:bg-gray-50 transition-colors gap-2 sm:gap-0"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`p-1 sm:p-2 rounded-full flex-shrink-0 ${
                        order.orderStatus === 'completed' ? 'bg-green-100' : 
                        order.orderStatus === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <ShoppingCart className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          order.orderStatus === 'completed' ? 'text-green-600' : 
                          order.orderStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">
                          Order #{order.id?.slice(-8) || order.id || 'N/A'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {order.user?.name || order.user?.email || "Customer"}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:text-right sm:items-end">
                      <p className="font-medium text-sm sm:text-base">
                        {formatCurrency(order.totalPrice || 0)}
                      </p>
                      <Badge 
                        variant="outline"
                        className={`text-xs ${
                          order.orderStatus === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                          order.orderStatus === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                          'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {order.orderStatus || 'pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Services */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base sm:text-lg">Recent Services</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs sm:text-sm"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentServices.length === 0 ? (
              <div className="text-center py-4 sm:py-8 text-gray-500">
                <Wrench className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-gray-300" />
                <p className="text-sm sm:text-base">No services yet</p>
                <p className="text-xs sm:text-sm mt-1 sm:mt-2">Add your first service to get started</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentServices.map((service) => (
                  <div 
                    key={service.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 border rounded-lg hover:bg-gray-50 transition-colors gap-2 sm:gap-0"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1 sm:p-2 rounded-full bg-purple-100 flex-shrink-0">
                        <Wrench className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{service.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                          {service.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:text-right sm:items-end">
                      <p className="font-medium text-sm sm:text-base">
                        {service.price ? formatKES(service.price) : "N/A"}
                      </p>
                      {service.user && (
                        <p className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">
                          by {service.user.name || service.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Popular Products</CardTitle>
          </CardHeader>
          <CardContent>
            {products.slice(0, 4).length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm sm:text-base">No products available</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {products.slice(0, 4).map((product) => (
                  <div 
                    key={product.id} 
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-3 h-3 sm:w-5 sm:h-5 text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{product.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {formatCurrency(product.price || 0)}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline"
                      className={`text-xs px-2 py-1 ${
                        (product.stockQuantity || 0) > 10 ? 'bg-green-50 text-green-700 border-green-200' : 
                        (product.stockQuantity || 0) > 0 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                        'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      Stock: {product.stockQuantity || 0}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            {users.slice(0, 4).length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm sm:text-base">No users registered</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {users.slice(0, 4).map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-3 h-3 sm:w-5 sm:h-5 text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{user.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                      </div>
                    </div>
                    {/* Approved text inside card with proper badge styling */}
                    {getUserStatusBadge(user)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg">
              <div className="p-1 sm:p-2 rounded-full bg-blue-100 flex-shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Last Updated</p>
                <p className="font-medium text-sm sm:text-base truncate">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg">
              <div className="p-1 sm:p-2 rounded-full bg-green-100 flex-shrink-0">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">System Status</p>
                <p className="font-medium text-green-600 text-sm sm:text-base truncate">
                  All Systems Operational
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg">
              <div className="p-1 sm:p-2 rounded-full bg-purple-100 flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Uptime</p>
                <p className="font-medium text-sm sm:text-base">99.9%</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg">
              <div className="p-1 sm:p-2 rounded-full bg-amber-100 flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Growth Rate</p>
                <p className="font-medium text-sm sm:text-base">+12.5% this month</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;