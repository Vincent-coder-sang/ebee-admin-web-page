import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { setHeaders, url } from "./api";

const initialState = {
  fines: [],
  status: null,
  error: null,
};

// Get all fines
export const getFine = createAsyncThunk(
  "fine/getFine",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${url}/fine/get`, setHeaders());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch fines";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

// Create new fine
export const createFine = createAsyncThunk(
  "fine/createFine",
  async (fineData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${url}/fine/create`,
        fineData,
        setHeaders()
      );
      toast.success("Fine created successfully!", { position: "top-center" });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create fine";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

// Update fine
export const updateFine = createAsyncThunk(
  "fine/updateFine",
  async ({ fineId, fineData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${url}/fine/update/${fineId}`,
        fineData,
        setHeaders()
      );
      toast.success("Fine updated successfully!", { position: "top-center" });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update fine";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

// Delete fine
export const deleteFine = createAsyncThunk(
  "fine/deleteFine",
  async (fineId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${url}/fine/delete/${fineId}`,
        setHeaders()
      );
      toast.success("Fine deleted successfully!", { position: "top-center" });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete fine";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

const fineSlice = createSlice({
  name: "fine",
  initialState,
  reducers: {
   
  },
  extraReducers: (builder) => {
    builder
      // Get All Fines
      .addCase(getFine.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(getFine.fulfilled, (state, { payload }) => {
        state.status = "success";
        state.fines = payload;
        state.error = null;
      })
      .addCase(getFine.rejected, (state, { payload }) => {
        state.status = "rejected";
        state.error = payload;
      })

      // Create Fine
      .addCase(createFine.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(createFine.fulfilled, (state, { payload }) => {
        state.status = "success";
        state.fines.push(payload);
        state.error = null;
      })
      .addCase(createFine.rejected, (state, { payload }) => {
        state.status = "rejected";
        state.error = payload;
      })

      // Update Fine
      .addCase(updateFine.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(updateFine.fulfilled, (state, { payload }) => {
        state.status = "success";
        state.fines = state.fines.map((fine) =>
          fine._id === payload._id ? payload : fine
        );
        state.error = null;
      })
      .addCase(updateFine.rejected, (state, { payload }) => {
        state.status = "rejected";
        state.error = payload;
      })

      // Delete Fine
      .addCase(deleteFine.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(deleteFine.fulfilled, (state, { payload }) => {
        state.status = "success";
        state.fines = state.fines.filter((fine) => fine._id !== payload._id);
        state.error = null;
      })
      .addCase(deleteFine.rejected, (state, { payload }) => {
        state.status = "rejected";
        state.error = payload;
      });
  },
});

export default fineSlice.reducer;