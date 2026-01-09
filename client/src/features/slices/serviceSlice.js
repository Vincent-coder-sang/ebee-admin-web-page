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

export const fetchServices = createAsyncThunk("services/fetchServices", async () => {
  try {
    const headers = await setHeaders()
    const response = await axios.get(`${url}/services/get`, headers);

    const message = response?.data?.message;

    console.log("message from fetchServices", message);

    console.log("response from fetchServices", response?.data);

    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message, {
      position: "top-center",
    });
  }
});

export const deleteService = createAsyncThunk(
  "services/deleteService",
  async (serviceId) => {
    try {
      const headers = await setHeaders()
      const response = await axios.delete(
        `${url}/services/delete/${serviceId}`,
        headers
      );
      const message = response?.data?.message
      console.log("deleteService -> message", message)
      toast.success(message, {
        position: "top-center",
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      console.log("deleteService -> errorMessage", errorMessage)
      toast.error(errorMessage, {
        position: "top-center",
      });
    }
  }
);

export const createService = createAsyncThunk(
  "services/createService",
  async (serviceData) => {
    try {
      const headers = await setHeaders()
      console.log("createService -> headers", headers)
      const response = await axios.post(`${url}/services/create`, serviceData, headers);
      toast.success(response?.data?.message, {
        position: "top-center",
      });
      console.log("response from create service, response.data", response.data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      console.log("error from create service", errorMessage);
      toast.error(errorMessage, {
        position: "top-center",
      });
    }
  }
);

export const updateService = createAsyncThunk(
  "services/updateService",
  async ({ serviceData, serviceId }) => {
    try {
      const headers = await setHeaders();
      console.log("Updating service ID:", serviceId);
      console.log("Update data:", serviceData);
      
      const response = await axios.put(
        `${url}/services/update/${serviceId}`,
        serviceData,
        headers
      );
      
      toast.success(response?.data?.message, {
        position: "top-center",
      });
      
      // Return the updated service data with its ID
      return {
        ...response.data,
        id: serviceId,
        ...serviceData,
      };
    } catch (error) {
      console.error("Update service error:", error.response?.data);
      toast.error(error.response?.data?.message, {
        position: "top-center",
      });
      throw error;
    }
  }
);


const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.list = action.payload.data;
        state.status = "success";
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      })
      .addCase(createService.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createService.fulfilled, (state, action) => {
        console.log("action.payload", action.payload);
        state.list = action.payload.data;
        state.status = "success";
      })
      .addCase(createService.rejected, (state,action) => {
        state.status = "rejected";
          state.error = action.payload;
      })
      .addCase(deleteService.pending, (state) => {
        state.status = "pending";
      })
      .addCase(deleteService.fulfilled, (state, action) => {
         state.list = state.list.filter(
          (service) => service.id !== action.payload
        );
        state.status = "success";
      })
      .addCase(deleteService.rejected, (state) => {
        state.status = "rejected";
      })
      .addCase(updateService.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateService.fulfilled, (state, action) => {
        // const updatedService = action.payload;
        const updatedId = action.payload.id;
         if (updatedId) {
          const index = state.list.findIndex(
            (service) => service.id === updatedId
          );
          if (index !== -1) {
            // Merge the existing service with updated data
            state.list[index] = {
              ...state.list[index],
              ...action.payload,
            };
          }
        }
        state.status = "success";
      })
      .addCase(updateService.rejected, (state, action) => {
        state.status = "rejected";
          state.error = action.payload;
      });
  },
});

export default servicesSlice.reducer;
