// src/redux/slices/reportsSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { setHeaders, url } from "./api";

const initialState = {
  // Report data
  purchaseOrders: [],
  serviceBookings: [],
  orderReports: [],
  customReports: [],
  
  // Generated reports from backend
  generatedReports: [],
  
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
  
  // Filters
  filters: {
    dateRange: { start: null, end: null },
    status: null,
    type: null,
    reportType: null
  },
  
  // Loading states
  loading: false,
  status: null,
  error: null
};

// Get aggregated data for reports
export const getAggregatedReportData = createAsyncThunk(
  "reports/getAggregatedData",
  async (_, { rejectWithValue }) => {
    try {
      // Fetch all data needed for reports
      const [ordersRes, bookingsRes, servicesRes, feedbacksRes, usersRes] = await Promise.all([
        axios.get(`${url}/orders/get`, setHeaders()),
        axios.get(`${url}/bookings/get`, setHeaders()),
        axios.get(`${url}/services/get`, setHeaders()),
        axios.get(`${url}/feedbacks/get`, setHeaders()),
        axios.get(`${url}/users/get`, setHeaders())
      ]);

      return {
        orders: ordersRes.data.data || [],
        bookings: bookingsRes.data.data || [],
        services: servicesRes.data.data || [],
        feedbacks: feedbacksRes.data.data || [],
        users: usersRes.data.data || [],
        summary: {
          totalOrders: (ordersRes.data.data || []).length,
          totalBookings: (bookingsRes.data.data || []).length,
          totalRevenue: (ordersRes.data.data || []).reduce((sum, order) => 
            sum + (parseFloat(order.total_price) || 0), 0),
          totalUsers: (usersRes.data.data || []).length,
          totalProducts: 0, // Add if you have products endpoint
          totalServices: (servicesRes.data.data || []).length,
          totalFeedbacks: (feedbacksRes.data.data || []).length,
          totalRentals: 0 // Add if you have rentals endpoint
        }
      };
    } catch (error) {
      console.error("Error fetching aggregated data:", error);
      const message = error.response?.data?.message || "Failed to fetch report data";
      return rejectWithValue(message);
    }
  }
);

// Generate sales report (using new backend)
export const generateSalesReport = createAsyncThunk(
  "reports/generateSalesReport",
  async ({ startDate, endDate, format = 'pdf' }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${url}/reports/generate/sales`,
        { startDate, endDate, format },
        setHeaders()
      );
      toast.success("Sales report generated successfully!", { position: "top-center" });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to generate sales report";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

// Generate feedback report
export const generateFeedbackReport = createAsyncThunk(
  "reports/generateFeedbackReport",
  async ({ minRating = 0, format = 'pdf' }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${url}/reports/generate/feedback`,
        { minRating, format },
        setHeaders()
      );
      toast.success("Feedback report generated successfully!", { position: "top-center" });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to generate feedback report";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

// Filter purchase orders
export const filterPurchaseOrders = createAsyncThunk(
  "reports/filterPurchaseOrders",
  async (filters = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      let orders = state.reports.orders || [];
      
      if (filters.dateRange?.start && filters.dateRange?.end) {
        orders = orders.filter(order => {
          if (!order.created_at) return true;
          const orderDate = new Date(order.created_at);
          return orderDate >= new Date(filters.dateRange.start) && 
                 orderDate <= new Date(filters.dateRange.end);
        });
      }
      
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

// Filter service bookings
export const filterServiceBookings = createAsyncThunk(
  "reports/filterServiceBookings",
  async (filters = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      let bookings = state.reports.bookings || [];
      
      if (filters.dateRange?.start && filters.dateRange?.end) {
        bookings = bookings.filter(booking => {
          if (!booking.created_at) return true;
          const bookingDate = new Date(booking.created_at);
          return bookingDate >= new Date(filters.dateRange.start) && 
                 bookingDate <= new Date(filters.dateRange.end);
        });
      }
      
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

// Export report data
export const exportReportData = createAsyncThunk(
  "reports/exportData",
  async ({ type, data, fileName = 'report', format = 'csv' }, { rejectWithValue }) => {
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
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Aggregated Data
      .addCase(getAggregatedReportData.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAggregatedReportData.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseOrders = action.payload.orders;
        state.serviceBookings = action.payload.bookings;
        state.summary = action.payload.summary;
        // Store raw data for other report types
        state.orders = action.payload.orders;
        state.bookings = action.payload.bookings;
        state.services = action.payload.services;
        state.feedbacks = action.payload.feedbacks;
        state.users = action.payload.users;
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

      // Generate Sales Report
      .addCase(generateSalesReport.pending, (state) => {
        state.status = "pending";
      })
      .addCase(generateSalesReport.fulfilled, (state, action) => {
        state.status = "success";
        state.generatedReports.push(action.payload);
        toast.success("Sales report ready for download!");
      })
      .addCase(generateSalesReport.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      })

      // Generate Feedback Report
      .addCase(generateFeedbackReport.pending, (state) => {
        state.status = "pending";
      })
      .addCase(generateFeedbackReport.fulfilled, (state, action) => {
        state.status = "success";
        state.generatedReports.push(action.payload);
        toast.success("Feedback report ready for download!");
      })
      .addCase(generateFeedbackReport.rejected, (state, action) => {
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

export const { setFilters, clearFilters, setReportType } = reportsSlice.actions;
export default reportsSlice.reducer;