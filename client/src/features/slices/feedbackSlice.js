import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { setHeaders, url } from "./api";

const initialState = {
  list: [],
  status: null,
  error: null,
};

export const getFeedback = createAsyncThunk(
  "feedback/getFeedback",
  async (feedbackId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${url}/feedbacks/get/${feedbackId}`, setHeaders());
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch feedback";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

export const addFeedback = createAsyncThunk(
  "feedback/addFeedback",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${url}/feedbacks/create`, data, setHeaders());
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add feedback";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

export const deleteFeedback = createAsyncThunk(
  "feedback/deleteFeedback",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${url}/feedbacks/delete/${id}`, setHeaders()); // Fixed `id`
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete feedback";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

export const updateFeedback = createAsyncThunk(
  "feedback/updateFeedback",
  async ({ data, feedbackId }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${url}/feedbacks/update/${feedbackId}`, data, setHeaders());
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update feedback";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

export const getFeedbacks = createAsyncThunk(
  "feedback/getFeedbacks",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${url}/feedbacks/get`, setHeaders());
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch feedbacks";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

const feedbackSlice = createSlice({
  name: "feedbacks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFeedback.pending, (state) => {
        state.status = "pending";
      })
      .addCase(getFeedback.fulfilled, (state, action) => {
        state.status = "success";
        state.list = [action.payload]; // Keep consistency
      })
      .addCase(getFeedback.rejected, (state) => {
        state.status = "rejected";
      })

      .addCase(getFeedbacks.pending, (state) => {
        state.status = "pending";
      })
      .addCase(getFeedbacks.fulfilled, (state, action) => {
        state.status = "success";
        state.list = action.payload; // Changed to maintain consistency
      })
      .addCase(getFeedbacks.rejected, (state) => {
        state.status = "rejected";
      })

      .addCase(addFeedback.pending, (state) => {
        state.status = "pending";
      })
      .addCase(addFeedback.fulfilled, (state, action) => {
        state.status = "success";
        state.list.push(action.payload); // Add new feedback to list
      })
      .addCase(addFeedback.rejected, (state) => {
        state.status = "rejected";
      })

      .addCase(deleteFeedback.pending, (state) => {
        state.status = "pending";
      })
      .addCase(deleteFeedback.fulfilled, (state, action) => {
        state.status = "success";
        state.list = state.list.filter((r) => r.id !== action.payload.id); // Remove deleted feedback
      })
      .addCase(deleteFeedback.rejected, (state) => {
        state.status = "rejected";
      })

      .addCase(updateFeedback.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateFeedback.fulfilled, (state, action) => {
        state.status = "success";
        state.list = state.list.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ); // Update the existing feedback
      })
      .addCase(updateFeedback.rejected, (state) => {
        state.status = "rejected";
      });
  },
});

export default feedbackSlice.reducer;
