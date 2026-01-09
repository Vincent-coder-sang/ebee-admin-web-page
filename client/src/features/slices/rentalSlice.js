import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { setHeaders, url } from "./api";

const initialState = {
  list: [],
  status: null,
  error: null,
};

export const getRental = createAsyncThunk(
  "rental/getRental",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${url}/rental/get`, setHeaders());
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch rentals";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

export const createRental = createAsyncThunk(
  "rental/createRental",
  async (rentalData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${url}/rental/create`,
        rentalData,
        setHeaders()
      );
      toast.success("Rental created successfully!", { position: "top-center" });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create rental";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

export const updateRental = createAsyncThunk(
  "rental/updateRental",
  async ({ rentalId, rentalData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${url}/rental/update/${rentalId}`,
        rentalData,
        setHeaders()
      );
      toast.success("Rental updated successfully!", { position: "top-center" });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update rental";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

export const deleteRental = createAsyncThunk(
  "rental/deleteRental",
  async (rentalId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${url}/rental/delete/${rentalId}`,
        setHeaders()
      );
      toast.success("Rental deleted successfully!", { position: "top-center" });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete rental";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

const rentalSlice = createSlice({
  name: "rentals",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get All Rentals
      .addCase(getRental.pending, (state) => {
        state.status = "pending";
      })
      .addCase(getRental.fulfilled, (state, { payload }) => {
        state.status = "success";
        state.list = payload;
      })
      .addCase(getRental.rejected, (state) => {
        state.status = "rejected";
      })

      // Create Rental
      .addCase(createRental.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createRental.fulfilled, (state, { payload }) => {
        state.status = "success";
        state.list.push(payload);
      })
      .addCase(createRental.rejected, (state) => {
        state.status = "rejected";
      })

      // Update Rental
      .addCase(updateRental.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateRental.fulfilled, (state, { payload }) => {
        state.status = "success";
        state.list = state.list.map((rental) =>
          rental.id === payload.id ? payload : rental
        );
      })
      .addCase(updateRental.rejected, (state) => {
        state.status = "rejected";
      })

      // Delete Rental
      .addCase(deleteRental.pending, (state) => {
        state.status = "pending";
      })
      .addCase(deleteRental.fulfilled, (state, { payload }) => {
        state.status = "success";
        state.list = state.list.filter((rental) => rental.id !== payload.id);
      })
      .addCase(deleteRental.rejected, (state) => {
        state.status = "rejected";
      });
  },
});

export default rentalSlice.reducer;