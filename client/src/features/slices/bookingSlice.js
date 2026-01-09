import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { setHeaders, url } from "./api";

const initialState = {
  list: [],
  userBookings: [], // For storing bookings by user
  status: null,
  error: null,
};

// Get all bookings
export const getBookings = createAsyncThunk(
  "booking/getBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${url}/bookings/get`, setHeaders());
      console.log("Get bookings response:", response.data); // Log entire response for debugging
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch bookings";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

// Create new booking
export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${url}/bookings/create`,
        bookingData,
        setHeaders()
      );
      toast.success(response.data.message, { position: "top-center" });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create booking";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

// Update booking
export const updateBooking = createAsyncThunk(
  "booking/updateBooking",
  async ({ bookingId, bookingData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${url}/bookings/update/${bookingId}`,
        bookingData,
        setHeaders()
      );
      toast.success(response.data.message, { position: "top-center" });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update booking";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

// Delete booking
export const deleteBooking = createAsyncThunk(
  "booking/deleteBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${url}/bookings/delete/${bookingId}`,
        setHeaders()
      );
      toast.success(response.data.message, { position: "top-center" });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete booking";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

// Get bookings by user (optional)
export const getBookingsByUser = createAsyncThunk(
  "booking/getBookingsByUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${url}/bookings/get/${userId}`,
        setHeaders()
      );
      console.log("Get bookings by user response:", response.data); // Log entire response for debugging
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch user bookings";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    
  },
  extraReducers: (builder) => {
    builder
      // Get All Bookings
      .addCase(getBookings.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(getBookings.fulfilled, (state, action ) => {
        state.status = "success";
        state.list = action.payload.data;
        state.error = null;
      })
      .addCase(getBookings.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.message;
      })

      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.status = "success";
        state.list.push(action.payload);
        state.error = null;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.message;
      })

      // Update Booking
      .addCase(updateBooking.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        
        
        const index = state.userBookings.findIndex(
          (booking) => booking.id === action.payload.id
        );
        if (index !== -1) {
          state.userBookings[index] = action.payload;
        }
        state.status = "success";
        state.error = null;
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.message;
      })

      // Delete Booking
      .addCase(deleteBooking.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.status = "success";

        state.list = state.list.filter((booking) => booking.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.message;
      })

      // Get Bookings by User
      .addCase(getBookingsByUser.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(getBookingsByUser.fulfilled, (state, action) => {
        state.status = "success";
        state.userBookings = action.payload.data;
        state.error = null;
      })
      .addCase(getBookingsByUser.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.message;
      });
  },
});

export default bookingSlice.reducer;