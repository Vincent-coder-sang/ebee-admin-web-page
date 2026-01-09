/** @format */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { url, setHeaders } from "./api";
import { toast } from "react-toastify";

const initialState = {
  list: [],
  status: null,
  error: null,
};

export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  try {
    const response = await axios.get(`${url}/users/get`, setHeaders());
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message, {
      position: "top-center",
    });
    throw error;
  }
});

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId) => {
    try {
      const response = await axios.delete(
        `${url}/users/delete/${userId}`,
        setHeaders()
      );
      toast.success(response?.data?.message, {
        position: "top-center",
      });
      return { ...response.data, deletedUserId: userId };
    } catch (error) {
      toast.error(error.response?.data?.message, {
        position: "top-center",
      });
      throw error;
    }
  }
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData) => {
    try {
      const response = await axios.post(`${url}/users/create`, userData);
      toast.success(response?.data?.message, {
        position: "top-center",
      });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message, {
        position: "top-center",
      });
      throw error;
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (userData) => {
    console.log("updateUser - FULL PAYLOAD:", userData);
    
    // Extract userId and userData from the payload
    const userId = userData.userId;
    const updateData = userData.userData;
    
    console.log("updateUser - userId:", userId);
    console.log("updateUser - updateData:", updateData);
    
    if (!userId) {
      console.log("❌ updateUser - ERROR: userId is undefined");
      throw new Error("User ID is required");
    }
    
    try {
      const response = await axios.put(
        `${url}/users/update/${userId}`,
        updateData,
        setHeaders()
      );
      toast.success(response?.data?.message, {
        position: "top-center",
      });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message, {
        position: "top-center",
      });
      throw error;
    }
  }
);

export const approveUsers = createAsyncThunk(
  "users/approveUsers",
  async ({ userData }, {rejectWithValue}) => {
    console.log("approveUsers - START", userData);
    try {
      const response = await axios.put(
        `${url}/users/approve`,
        userData,
        setHeaders()
      );
      console.log("approveUsers - SUCCESS", response.data);
      toast.success(response?.data?.message, {
        position: "top-center",
      });
      return response.data;
    } catch (error) {
      console.log("approveUsers - ERROR", error.response?.data);
      const message =  error.response?.data?.message
      toast.error(error.response?.data?.message , {
        position: "top-center",
      });
      return rejectWithValue(message)
    }
  }
);

export const approveUser = createAsyncThunk(
  "users/approveUser",
  async ({ userId, userData }, {rejectWithValue}) => {
    console.log("approveUser - START", userId, userData);
    try {
      const response = await axios.put(
        `${url}/users/approve/${userId}`,
        userData,
        setHeaders()
      );
      console.log("approveUser - SUCCESS", response.data);
      toast.success(response?.data?.message, {
        position: "top-center",
      });
      return response.data;
    } catch (error) {
      console.log("approveUser - ERROR", error.response?.data);
      const message = error.response?.data?.message
      toast.error(error.response?.data?.message || "Approval failed", {
        position: "top-center",
      });
      return rejectWithValue(message)
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.list = action.payload.data;
        state.status = "success";
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.status = "rejected";
      })
      
      .addCase(createUser.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createUser.fulfilled, (state, action) => {
        // Use state.list instead of state.users
        if (action.payload?.data && state.list) {
          state.list.push(action.payload.data);
        }
        state.status = "success";
      })
      .addCase(createUser.rejected, (state) => {
        state.status = "rejected";
      })
      
      .addCase(deleteUser.pending, (state) => {
        state.status = "pending";
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        // Use state.list instead of state.users
        if (action.payload?.deletedUserId && state.list) {
          state.list = state.list.filter((user) => user.id !== action.payload.deletedUserId);
        }
        state.status = "success";
      })
      .addCase(deleteUser.rejected, (state) => {
        state.status = "rejected";
      })
      
      .addCase(updateUser.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload?.data;
        // Use state.list instead of state.users
        if (updatedUser && state.list) {
          const userIndex = state.list.findIndex(user => user.id === updatedUser.id);
          if (userIndex !== -1) {
            state.list[userIndex] = { ...state.list[userIndex], ...updatedUser };
          }
        }
        state.status = "success";
      })
      .addCase(updateUser.rejected, (state) => {
        state.status = "rejected";
      })
      
      .addCase(approveUsers.pending, (state) => {
        console.log("approveUsers - PENDING");
        state.status = "pending";
      })
      .addCase(approveUsers.fulfilled, (state, action) => {
        console.log("approveUsers - FULFILLED", action.payload);
        const updatedUser = action.payload?.data;
        // Use state.list instead of state.users
        if (updatedUser && state.list) {
          const userIndex = state.list.findIndex(user => user.id === updatedUser.id);
          if (userIndex !== -1) {
            state.list[userIndex] = { ...state.list[userIndex], ...updatedUser };
          }
        }
        state.status = "success";
      })
      .addCase(approveUsers.rejected, (state) => {
        console.log("approveUsers - REJECTED");
        state.status = "rejected";
      })
      
      .addCase(approveUser.pending, (state) => {
        console.log("approveUser - PENDING");
        state.status = "pending";
      })
      .addCase(approveUser.fulfilled, (state, action) => {
        console.log("approveUser - FULFILLED", action.payload);
        const updatedUser = action.payload?.data;
        // Use state.list instead of state.users
        if (updatedUser && state.list) {
          const userIndex = state.list.findIndex(user => user.id === updatedUser.id);
          if (userIndex !== -1) {
            state.list[userIndex] = { ...state.list[userIndex], ...updatedUser };
          }
        }
        state.status = "success";
      })
      .addCase(approveUser.rejected, (state) => {
        console.log("approveUser - REJECTED");
        state.status = "rejected";
      })
  },
});

export default usersSlice.reducer;