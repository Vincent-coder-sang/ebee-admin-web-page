/** @format */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { setHeaders, url } from "./api";

const initialState = {
  list: [],
  status: null,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, {rejectWithValue}) => {
    try {
      const headers = await setHeaders()
      const response = await axios.get(`${url}/products/get`, headers);
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      console.log(message)
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

export const fetchProduct = createAsyncThunk(
  "products/fetchProduct",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${url}/products/get/${productId}`,
        setHeaders()
      );
      console.log("Fetch product response:", response.data); // Log entire response for debugging
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message, { position: "top-center" });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const headers = await setHeaders()
      const response = await axios.post(
        `${url}/products/create`,
        formData,
        headers
      );
      toast.success(response?.data.message, { position: "top-center" });
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

export const removeProduct = createAsyncThunk(
  "products/removeProduct",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${url}/products/delete/${productId}`,
        setHeaders()
      );
      toast.success(response?.data.message, { position: "top-center" });
      return productId; // Return the deleted product's ID
    } catch (error) {
      console.log("Error deletin product", error.response?.data.message);
      const message = error.response?.data.message || "Error deleting product";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ productId, values }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${url}/products/update/${productId}`,
        values,
        setHeaders()
      );
      console.log("update product response.. ", response);
      toast.success(response?.message, { position: "top-center" });
      return response.data; // Assuming the server returns the updated product
    } catch (error) {
      console.log("Error updating product", error.response?.message);
      const message = error.response?.message || "Error updating product";
      toast.error(message, { position: "top-center" });
      return rejectWithValue(message);
    }
  }
);

export const searchProducts = createAsyncThunk(
  "products/searchProducts", // The action type
  async ({ values }, { rejectWithValue }) => {
    try {
      // Make a POST request to the search endpoint
      const response = await axios.post(`${url}/products/search`, values, {
        headers: setHeaders(), // Assuming setHeaders handles authentication token and other necessary headers
      });
      return response.data; // The server response containing the search results
    } catch (error) {
      console.log("Error searching products:", error.response?.data.message);
      const message =
        error.response?.data.message || "Error searching products";
      toast.error(message, { position: "bottom-left" });
      return rejectWithValue(message); // Reject with error message to update Redux state
    }
  }
);

// Slice
const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProduct.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.list = action.payload.data;
        state.status = "success";
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.message;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.list = action.payload.data;
        state.status = "success";
      })
      .addCase(fetchProducts.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.message;
        console.error("Fetch products error:", action.payload.message);
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.list.push(action.payload);
        state.status = "success";
      })
      .addCase(createProduct.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.message;
      })
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.list = state.list.filter(
          (product) => product.id !== action.payload
        );
        state.status = "success";
      })
      .addCase(removeProduct.pending, (state) => {
        state.status = "pending";
      })
      .addCase(removeProduct.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.message;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (product) => product.id === action.payload.id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        state.status = "success";
      })
      .addCase(updateProduct.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.message;
      });
  },
});

export default productsSlice.reducer;
