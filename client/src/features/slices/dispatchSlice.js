/* eslint-disable no-unused-vars */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { setHeaders, url } from "./api";

const initialState = {
  list: [],
  status: null,
  error: null
};

export const getDispatches = createAsyncThunk(
  "dispatch/getDispatches",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${url}/dispatches/get`, setHeaders());
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch dispatch records";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

export const createDispatch = createAsyncThunk(
  "dispatch/createDispatch",
  async (dispatchData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${url}/dispatches/create`, dispatchData, setHeaders());
      toast.success("Dispatch created successfully!", { position: "top-center" });
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create dispatch";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

export const updateDispatch = createAsyncThunk(
  "dispatch/updateDispatch",
  async ({ dispatchId, dispatchData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${url}/dispatches/update/${dispatchId}`,
        dispatchData,
        setHeaders()
      );
      toast.success("Dispatch updated successfully!", { position: "top-center" });
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update dispatch";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

export const deleteDispatch = createAsyncThunk(
  "dispatch/deleteDispatch",
  async (dispatchId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${url}/dispatches/delete/${dispatchId}`, setHeaders());
      toast.success("Dispatch deleted successfully!", { position: "top-center" });
      return { id: dispatchId }; // since API returns no data
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete dispatch";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

const dispatchSlice = createSlice({
  name: "dispatch",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDispatches.pending, (state) => {
        state.status = "pending";
      })
      .addCase(getDispatches.fulfilled, (state, action) => {
        state.status = "success";
        state.list = action.payload.data;
      })
      .addCase(getDispatches.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message;
        console.log("action.error.message", action.error.message)
      })

      .addCase(createDispatch.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createDispatch.fulfilled, (state, action) => {
        state.status = "success";
        state.list.push(action.payload.data);
      })
      .addCase(createDispatch.rejected, (state) => {
        state.status = "rejected";
      })

      .addCase(updateDispatch.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateDispatch.fulfilled, (state, action) => {
        state.status = "success";
        state.list = state.list.map(item =>
          item.id === action.payload.data.id ? action.payload.data : item
        );
      })
      .addCase(updateDispatch.rejected, (state) => {
        state.status = "rejected";
      })

      .addCase(deleteDispatch.pending, (state) => {
        state.status = "pending";
      })
      .addCase(deleteDispatch.fulfilled, (state, action) => {
        state.status = "success";
        state.list = state.list.filter(item => item.id !== action.payload.id);
      })
      .addCase(deleteDispatch.rejected, (state) => {
        state.status = "rejected";
      });
  },
});

export default dispatchSlice.reducer;
