/** @format */

// imports
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { setHeaders, url } from "./api";

const initialState = {
  list: [],
  status: null,
  error: null
};

export const fetchOrders = createAsyncThunk("orders/fetchOrders", async () => {
  try {
    const response = await axios.get(`${url}/orders/get`, setHeaders());
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message, {
      position: "top-center",
    });
  }
});

export const fetchOrder = createAsyncThunk(
  "orders/fetchOrder",
  async (orderId) => {
    try {
      const response = await axios.get(
        `${url}/orders/get/${orderId}`,
        setHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching order:", error.response?.message);
      toast.error(error.response?.data, {
        position: "bottom-left",
      });
    }
  }
);
export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${url}/orders/create`,
        formData,
        setHeaders()
      );

      toast.success(response.data?.message, {
        position: "top-center",
      });

      return response.data;
    } catch (error) {
      console.error(
        "Error creating order:",
        error.response?.data?.message || error.message
      );

      toast.error(error.response?.data?.message, {
        position: "bottom-left",
      });

      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (orderId) => {
    try {
      const response = await axios.delete(
        `${url}/orders/delete/${orderId}`,
        setHeaders()
      );
      toast.success(response.data.message, {
        position: "top-center",
      });
      return orderId; // Return the deleted order's ID
    } catch (error) {
      console.error("Error deleting order:", error.response?.message);
      toast.error(error.response?.data?.message, {
        position: "top-center",
      });
    }
  }
);

export const updateOrder = createAsyncThunk(
  "orders/updateOrder",
  async ({ orderId, values }) => {
    try {
      const response = await axios.put(
        `${url}/orders/update/${orderId}`,
        values,
        setHeaders()
      );
      toast.success(response.data.message, {
        position: "top-center",
      });
      return response.data; // Assuming the server returns the updated order
    } catch (error) {
      console.error("Error updating order:", error.response?.message);
      toast.error(error.response?.data, {
        position: "bottom-left",
      });
    }
  }
);

// Slice
const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.list = action.payload.data;
        state.status = "success";
      })
      .addCase(fetchOrders.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchOrders.rejected, (state) => {
        state.status = "rejected";
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.list.push(action.payload);
        state.status = "success";
        toast.success(action.payload.message, {
          position: "top-center",
        });
      })
      .addCase(createOrder.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createOrder.rejected, (state) => {
        state.status = "rejected";
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.list = state.list.filter((order) => order.id !== action.payload);
        state.status = "success";
      })
      .addCase(deleteOrder.pending, (state) => {
        state.status = "pending";
      })
      .addCase(deleteOrder.rejected, (state) => {
        state.status = "rejected";
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        const index = state.list.findIndex(
          (order) => order.id === updatedOrder.id
        );
        if (index !== -1) {
          state.list[index] = updatedOrder;
        }
        state.status = "success";
      })
      .addCase(updateOrder.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateOrder.rejected, (state) => {
        state.status = "rejected";
      });
  },
});

export default ordersSlice.reducer;
