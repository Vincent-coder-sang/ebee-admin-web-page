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
    const response = await axios.get(`${url}/services/get`, setHeaders());

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
      const response = await axios.delete(
        `${url}/services/delete/${serviceId}`,
        setHeaders()
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
      const response = await axios.post(`${url}/services/create`, serviceData);
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
  async (serviceData) => {
    try {
      const response = await axios.post(
        `${url}/services/update/${serviceData.id}`,
        serviceData
      );
      const message = response?.data?.message;
      console.log("response from update service, response.data", response.data);
      toast.success(message, {
        position: "top-center",
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      console.log("error from update service", errorMessage);
      toast.error(errorMessage, {
        position: "top-center",
      });
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
        state.list = action.payload;
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
        const newList = state.list.filter((service) => service.id !== action.payload);
        state.list = newList;
        state.status = "success";
      })
      .addCase(deleteService.rejected, (state) => {
        state.status = "rejected";
      })
      .addCase(updateService.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateService.fulfilled, (state, action) => {
        const updatedService = action.payload;
        state.list = state.list.map((service) =>
          service.id === updatedService.id ? updatedService : service
        );
        state.status = "success";
      })
      .addCase(updateService.rejected, (state, action) => {
        state.status = "rejected";
          state.error = action.payload;
      });
  },
});

export default servicesSlice.reducer;
