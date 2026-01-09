import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { setHeaders, url } from "./api";

const initialState = {
  logs: [], // Changed from 'list' to 'logs' to match your controller naming
  status: null,
  error: null,
};

// Get all inventory logs
export const getInventoryLogs = createAsyncThunk(
  "inventory/getInventoryLogs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${url}/inventory/get`, setHeaders());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch inventory logs";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

// Create new inventory log
export const createInventoryLogs = createAsyncThunk(
  "inventory/createInventoryLogs",
  async (logData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${url}/inventory/create`,
        logData,
        setHeaders()
      );
      toast.success("Inventory log created successfully!", { position: "top-center" });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create inventory log";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

// Delete inventory log
export const deleteInventoryLogs = createAsyncThunk(
  "inventory/deleteInventoryLogs",
  async (inventoryId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${url}/inventory/delete/${inventoryId}`,
        setHeaders()
      );
      toast.success("Inventory log deleted successfully!", { position: "top-center" });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete inventory log";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {

  },
  extraReducers: (builder) => {
    builder
      // Get All Inventory Logs
      .addCase(getInventoryLogs.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(getInventoryLogs.fulfilled, (state, { payload }) => {
        state.status = "success";
        state.logs = payload;
        state.error = null;
      })
      .addCase(getInventoryLogs.rejected, (state, { payload }) => {
        state.status = "rejected";
        state.error = payload;
      })

      // Create Inventory Log
      .addCase(createInventoryLogs.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(createInventoryLogs.fulfilled, (state, { payload }) => {
        state.status = "success";
        state.logs.push(payload);
        state.error = null;
      })
      .addCase(createInventoryLogs.rejected, (state, { payload }) => {
        state.status = "rejected";
        state.error = payload;
      })

      // Delete Inventory Log
      .addCase(deleteInventoryLogs.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(deleteInventoryLogs.fulfilled, (state, { payload }) => {
        state.status = "success";
        state.logs = state.logs.filter((log) => log._id !== payload._id);
        state.error = null;
      })
      .addCase(deleteInventoryLogs.rejected, (state, { payload }) => {
        state.status = "rejected";
        state.error = payload;
      });
  },
});

export default inventorySlice.reducer;