// src/redux/slices/reportsSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { setHeaders, url } from "./api";

const initialState = {
  // Reports from Reports table
  reports: [],
  
  // Aggregated data from other slices
  aggregatedData: {
    orders: [],
    bookings: [],
    rentals: [],
    products: [],
    services: [],
    feedbacks: [],
    users: []
  },
  
  // Summary statistics
  summary: {
    totalOrders: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalServices: 0,
    totalFeedbacks: 0,
    totalRentals: 0
  },
  
  // Filtered reports
  purchaseOrders: [],
  serviceBookings: [],
  orderReports: [],
  
  // Filters
  filters: {
    dateRange: { start: null, end: null },
    status: null,
    type: null,
    reportType: null // orders, rentals, payments, inventory, feedback, custom
  },
  
  // Loading states
  loading: false,
  status: null,
  error: null
};

// Get all reports from Reports table
export const getReports = createAsyncThunk(
  "reports/getReports",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${url}/report/get`, setHeaders());
      return response.data.data || [];
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch reports";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

// Create a new report
export const createReport = createAsyncThunk(
  "reports/createReport",
  async (reportData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${url}/report/create`,
        reportData,
        setHeaders()
      );
      toast.success("Report created successfully!", { position: "top-center" });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create report";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

// Delete a report
export const deleteReport = createAsyncThunk(
  "reports/deleteReport",
  async (reportId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${url}/report/delete/${reportId}`,
        setHeaders()
      );
      toast.success("Report deleted successfully!", { position: "top-center" });
      return reportId;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete report";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

// Fetch aggregated data from all slices for reporting
export const getAggregatedReportData = createAsyncThunk(
  "reports/getAggregatedData",
  async (_, { rejectWithValue }) => {
    try {
      // Fetch all data in parallel
      const [ordersRes, bookingsRes, usersRes, productsRes, servicesRes, feedbacksRes, rentalsRes] = await Promise.all([
        axios.get(`${url}/orders/get`, setHeaders()),
        axios.get(`${url}/bookings/get`, setHeaders()),
        axios.get(`${url}/users/get`, setHeaders()),
        axios.get(`${url}/products/get`, setHeaders()),
        axios.get(`${url}/services/get`, setHeaders()),
        axios.get(`${url}/feedbacks/get`, setHeaders()),
        axios.get(`${url}/rental/get`, setHeaders())
      ]);

      // Calculate total revenue from orders
      const totalRevenue = (ordersRes.data.data || []).reduce((sum, order) => {
        return sum + (parseFloat(order.total_price) || 0);
      }, 0);

      return {
        orders: ordersRes.data.data || [],
        bookings: bookingsRes.data.data || [],
        users: usersRes.data.data || [],
        products: productsRes.data.data || [],
        services: servicesRes.data.data || [],
        feedbacks: feedbacksRes.data.data || [],
        rentals: rentalsRes.data.data || [],
        summary: {
          totalOrders: (ordersRes.data.data || []).length,
          totalBookings: (bookingsRes.data.data || []).length,
          totalRevenue,
          totalUsers: (usersRes.data.data || []).length,
          totalProducts: (productsRes.data.data || []).length,
          totalServices: (servicesRes.data.data || []).length,
          totalFeedbacks: (feedbacksRes.data.data || []).length,
          totalRentals: (rentalsRes.data.data || []).length
        }
      };
    } catch (error) {
      console.error("Error fetching aggregated data:", error);
      const message = error.response?.data?.message || "Failed to fetch report data";
      return rejectWithValue(message);
    }
  }
);

// Filter purchase orders (from aggregated orders data)
export const filterPurchaseOrders = createAsyncThunk(
  "reports/filterPurchaseOrders",
  async (filters = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      let orders = state.reports.aggregatedData.orders || [];
      
      // Apply date filter
      if (filters.dateRange?.start && filters.dateRange?.end) {
        orders = orders.filter(order => {
          if (!order.created_at) return true;
          const orderDate = new Date(order.created_at);
          return orderDate >= new Date(filters.dateRange.start) && 
                 orderDate <= new Date(filters.dateRange.end);
        });
      }
      
      // Apply status filter
      if (filters.status) {
        orders = orders.filter(order => order.status === filters.status);
      }
      
      return orders;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to filter purchase orders";
      return rejectWithValue(message);
    }
  }
);

// Filter service bookings (from aggregated bookings data)
export const filterServiceBookings = createAsyncThunk(
  "reports/filterServiceBookings",
  async (filters = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      let bookings = state.reports.aggregatedData.bookings || [];
      
      // Apply date filter
      if (filters.dateRange?.start && filters.dateRange?.end) {
        bookings = bookings.filter(booking => {
          if (!booking.created_at) return true;
          const bookingDate = new Date(booking.created_at);
          return bookingDate >= new Date(filters.dateRange.start) && 
                 bookingDate <= new Date(filters.dateRange.end);
        });
      }
      
      // Apply status filter
      if (filters.status) {
        bookings = bookings.filter(booking => booking.status === filters.status);
      }
      
      return bookings;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to filter service bookings";
      return rejectWithValue(message);
    }
  }
);

// Generate custom report
export const generateCustomReport = createAsyncThunk(
  "reports/generateCustomReport",
  async (reportData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${url}/report/generate`,
        reportData,
        setHeaders()
      );
      toast.success("Custom report generated successfully!", { position: "top-center" });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to generate custom report";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

// Export report data - FIXED VERSION
export const exportReportData = createAsyncThunk(
  "reports/exportData",
  async ({ 
    type, 
    data, 
    format = 'csv', 
    fileName = 'report',
    customHeaders = null  // Fixed: added customHeaders parameter
  }, { rejectWithValue }) => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      let headers = [];
      let rows = [];

      switch (type) {
        case 'orders':
          headers = ["Order ID", "Date", "Customer", "Amount", "Status", "Payment Method"];
          rows = data.map(order => [
            order.id || order._id || 'N/A',
            new Date(order.created_at).toLocaleDateString(),
            order.user?.name || order.userId || 'N/A',
            `$${parseFloat(order.total_price || 0).toFixed(2)}`,
            order.status || 'pending',
            order.payment_method || 'N/A'
          ]);
          break;
          
        case 'bookings':
          headers = ["Booking ID", "Date", "Service", "Customer", "Status", "Scheduled Date"];
          rows = data.map(booking => [
            booking.id || booking._id || 'N/A',
            new Date(booking.created_at).toLocaleDateString(),
            booking.service?.name || booking.serviceId || 'N/A',
            booking.user?.name || booking.userId || 'N/A',
            booking.status || 'pending',
            booking.scheduled_date ? new Date(booking.scheduled_date).toLocaleDateString() : 'N/A'
          ]);
          break;
          
        case 'custom':
          // Fixed: Use customHeaders if provided, otherwise use default headers
          headers = customHeaders || ["ID", "Date", "Type", "Content"];
          rows = data.map(report => [
            report.id || report._id || 'N/A',
            new Date(report.createdAt || report.created_at).toLocaleDateString(),
            report.type || 'custom',
            report.content?.substring(0, 100) + '...' || 'No content'
          ]);
          break;
          
        default:
          headers = ["ID", "Date", "Type", "Details"];
          rows = data.map(item => [
            item.id || item._id || 'N/A',
            new Date(item.created_at || item.createdAt).toLocaleDateString(),
            type,
            JSON.stringify(item).substring(0, 100) + '...'
          ]);
      }

      csvContent += headers.join(',') + '\n';
      rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
      });

      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${fileName}_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Report exported successfully as ${format.toUpperCase()}`, { position: "top-center" });
      return { type, fileName };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to export report";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        dateRange: { start: null, end: null },
        status: null,
        type: null,
        reportType: null
      };
    },
    setReportType: (state, action) => {
      state.filters.reportType = action.payload;
    },
    // Add this reducer to directly update purchaseOrders
    setPurchaseOrders: (state, action) => {
      state.purchaseOrders = action.payload;
    },
    // Add this reducer to directly update serviceBookings
    setServiceBookings: (state, action) => {
      state.serviceBookings = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Reports
      .addCase(getReports.pending, (state) => {
        state.loading = true;
        state.status = "pending";
      })
      .addCase(getReports.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "success";
        state.reports = action.payload;
      })
      .addCase(getReports.rejected, (state, action) => {
        state.loading = false;
        state.status = "rejected";
        state.error = action.payload;
      })

      // Get Aggregated Data
      .addCase(getAggregatedReportData.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAggregatedReportData.fulfilled, (state, action) => {
        state.loading = false;
        state.aggregatedData = {
          orders: action.payload.orders,
          bookings: action.payload.bookings,
          users: action.payload.users,
          products: action.payload.products,
          services: action.payload.services,
          feedbacks: action.payload.feedbacks,
          rentals: action.payload.rentals
        };
        state.summary = action.payload.summary;
      })
      .addCase(getAggregatedReportData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Filter Purchase Orders
      .addCase(filterPurchaseOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(filterPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseOrders = action.payload;
      })
      .addCase(filterPurchaseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Filter Service Bookings
      .addCase(filterServiceBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(filterServiceBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.serviceBookings = action.payload;
      })
      .addCase(filterServiceBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Report
      .addCase(createReport.pending, (state) => {
        state.loading = true;
        state.status = "pending";
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "success";
        state.reports.unshift(action.payload);
      })
      .addCase(createReport.rejected, (state, action) => {
        state.loading = false;
        state.status = "rejected";
        state.error = action.payload;
      })

      // Delete Report
      .addCase(deleteReport.pending, (state) => {
        state.loading = true;
        state.status = "pending";
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "success";
        state.reports = state.reports.filter(report => report.id !== action.payload);
      })
      .addCase(deleteReport.rejected, (state, action) => {
        state.loading = false;
        state.status = "rejected";
        state.error = action.payload;
      })

      // Generate Custom Report
      .addCase(generateCustomReport.pending, (state) => {
        state.loading = true;
        state.status = "pending";
      })
      .addCase(generateCustomReport.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "success";
        state.reports.unshift(action.payload);
      })
      .addCase(generateCustomReport.rejected, (state, action) => {
        state.loading = false;
        state.status = "rejected";
        state.error = action.payload;
      })

      // Export Report Data
      .addCase(exportReportData.pending, (state) => {
        state.status = "pending";
      })
      .addCase(exportReportData.fulfilled, (state) => {
        state.status = "success";
      })
      .addCase(exportReportData.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      });
  }
});

export const { 
  setFilters, 
  clearFilters, 
  setReportType,
  setPurchaseOrders,
  setServiceBookings 
} = reportsSlice.actions;
export default reportsSlice.reducer;