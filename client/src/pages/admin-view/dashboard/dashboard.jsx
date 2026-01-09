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
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// Redux Thunks
import { fetchOrders } from "@/features/slices/orderSlice";
import { fetchProducts } from "@/features/slices/productSlice";
import { fetchUsers } from "@/features/slices/usersSlice";
import { fetchServices } from "@/features/slices/serviceSlice";

const AdminDashboard = () => {
  const dispatch = useDispatch();

  const { list: products = [] } = useSelector((state) => state.products);
  const { list: orders = [] } = useSelector((state) => state.orders);
  const { list: users = [] } = useSelector((state) => state.users);
  const { list: services = [] } = useSelector((state) => state.services);
  
  const isLoading = !products || !orders || !users || !services;

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchOrders());
    dispatch(fetchUsers());
    dispatch(fetchServices());
  }, [dispatch]);

  // Calculate revenue from orders
  const calculateRevenue = () => {
    return orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  };

  // Calculate average order value
  const calculateAverageOrderValue = () => {
    if (orders.length === 0) return 0;
    return calculateRevenue() / orders.length;
  };

  // Stats data including services
  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Registered users"
    },
    {
      title: "Total Products",
      value: products.length,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Available products"
    },
    {
      title: "Total Services",
      value: services.length,
      icon: Wrench,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Active services"
    },
    {
      title: "Total Orders",
      value: orders.length,
      icon: ShoppingCart,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      description: "All-time orders"
    },
    {
      title: "Total Revenue",
      value: `$${calculateRevenue().toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      description: "Gross revenue"
    },
    {
      title: "Avg Order Value",
      value: `$${calculateAverageOrderValue().toFixed(2)}`,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      description: "Average per order"
    }
  ];

  // Recent orders (last 5)
  const recentOrders = orders.slice(0, 5);

  // Recent services (last 3)
  const recentServices = services.slice(0, 3);

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

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome to your admin dashboard</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            dispatch(fetchProducts());
            dispatch(fetchOrders());
            dispatch(fetchUsers());
            dispatch(fetchServices());
          }}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">
                {stat.value}
              </div>
              <p className="text-xs text-gray-500">
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
            <CardTitle>Recent Orders</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                // You can add navigation to orders page here
                console.log("Navigate to orders");
              }}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        order.orderStatus === 'completed' ? 'bg-green-100' : 
                        order.orderStatus === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <ShoppingCart className={`w-4 h-4 ${
                          order.orderStatus === 'completed' ? 'text-green-600' : 
                          order.orderStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">Order #{order.id?.slice(-8) || order.id}</p>
                        <p className="text-sm text-gray-600">
                          {order.user?.name || "Customer"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(order.totalPrice || 0).toLocaleString()}</p>
                      <p className={`text-xs font-medium ${
                        order.orderStatus === 'completed' ? 'text-green-600' : 
                        order.orderStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {order.orderStatus || 'pending'}
                      </p>
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
            <CardTitle>Recent Services</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                // You can add navigation to services page here
                console.log("Navigate to services");
              }}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentServices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No services yet</p>
                <p className="text-sm mt-2">Add your first service to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentServices.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-purple-100">
                        <Wrench className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">KES {service.price}</p>
                      {service.user && (
                        <p className="text-xs text-gray-500">
                          by {service.user.name}
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
            <CardTitle className="text-lg">Popular Products</CardTitle>
          </CardHeader>
          <CardContent>
            {products.slice(0, 4).length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No products available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.slice(0, 4).map((product) => (
                  <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">${product.price}</p>
                      </div>
                    </div>
                    <div className={`text-sm px-3 py-1 rounded-full ${
                      (product.stockQuantity || 0) > 10 ? 'bg-green-100 text-green-800' : 
                      (product.stockQuantity || 0) > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      Stock: {product.stockQuantity || 0}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            {users.slice(0, 4).length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No users registered</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.slice(0, 4).map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className={`text-xs px-3 py-1 rounded-full ${
                      user.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.isApproved ? 'Approved' : 'Pending'}
                    </div>
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
          <CardTitle className="text-lg">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 rounded-full bg-blue-100">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 rounded-full bg-green-100">
                <AlertCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">System Status</p>
                <p className="font-medium text-green-600">All Systems Operational</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 rounded-full bg-purple-100">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="font-medium">99.9%</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 rounded-full bg-amber-100">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Growth Rate</p>
                <p className="font-medium">+12.5% this month</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;