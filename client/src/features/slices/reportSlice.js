import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { setHeaders, url } from "./api";

const initialState = {
  list: [],
  status: null,
  error: null,
};

// Get all reports
export const getReport = createAsyncThunk(
  "report/getReport",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${url}/report/get`, setHeaders());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch reports";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

// Create new report
export const createReport = createAsyncThunk(
  "report/createReport",
  async (reportData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${url}/report/create`,
        reportData,
        setHeaders()
      );
      toast.success("Report created successfully!", { position: "top-center" });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create report";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

// Delete report
export const deleteReport = createAsyncThunk(
  "report/deleteReport",
  async (reportId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${url}/report/delete/${reportId}`,
        setHeaders()
      );
      toast.success("Report deleted successfully!", { position: "top-center" });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete report";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      // Get All Reports
      .addCase(getReport.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(getReport.fulfilled, (state, { payload }) => {
        state.status = "success";
        state.list = payload;
        state.error = null;
      })
      .addCase(getReport.rejected, (state, { payload }) => {
        state.status = "rejected";
        state.error = payload;
      })

      // Create Report
      .addCase(createReport.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(createReport.fulfilled, (state, { payload }) => {
        state.status = "success";
        state.list.push(payload);
        state.error = null;
      })
      .addCase(createReport.rejected, (state, { payload }) => {
        state.status = "rejected";
        state.error = payload;
      })

      // Delete Report
      .addCase(deleteReport.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(deleteReport.fulfilled, (state, { payload }) => {
        state.status = "success";
        state.list = state.list.filter((report) => report._id !== payload._id);
        state.error = null;
      })
      .addCase(deleteReport.rejected, (state, { payload }) => {
        state.status = "rejected";
        state.error = payload;
      });
  },
});

export default reportSlice.reducer;