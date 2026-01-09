import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { setHeaders, url } from "./api";

const initialState = {
  list: [],
  status: null,
  error: null,
};

export const addProductToCart = createAsyncThunk(
  "cart/addProductToCart",
  async ({ userId, productId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${url}/cart/add`,
        { userId, productId }, // Removed quantity since the backend handles it
        setHeaders()
      );

      console.log("Product added to cart:", response.data);
      toast.success("Product added to cart", { position: "top-center" });

      return response.data; // Return the updated cart item
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to add product to cart";
      toast.error(errorMessage, { position: "top-center" });

      return rejectWithValue(errorMessage);
    }
  }
);

export const getCart = createAsyncThunk("cart/getCart", async (userId, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${url}/cart/get/${userId}`, setHeaders());
    console.log("Cart API Response:", response.data); // ✅ Log entire response
    return response.data.data;
  } catch (error) {
    console.error("Error fetching cart:", error.response?.data);
    toast.error(error.response?.data?.message, { position: "top-center" });
    return rejectWithValue(error.response?.data?.message);
  }
});

export const removeProductFromCart = createAsyncThunk(
  "cart/removeProductFromCart",
  async ({ userId, cartId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${url}/cart/delete/${userId}/${cartId}`, // ✅ Correct API URL with userId
        setHeaders()
      );
      toast.success(response.data.message, { position: "top-center" });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to remove product.";
      toast.error(errorMessage, { position: "top-center" });
      return rejectWithValue(errorMessage);
    }
  }
);



// Decrease product quantity
export const decreaseProductQuantity = createAsyncThunk(
  "cart/decreaseProductQuantity",
  async (cartId) => {
    try {
      const response = await axios.put(
        `${url}/cart/update/${cartId}/decrease`,
        {},
        setHeaders()
      );
      toast.success(response.data.message, { position: "top-center" });
      return response.data;
    } catch (error) {
      toast.error(error.response?.message, { position: "top-center" });
      console.log("Failed to decrease product quantity:", error.response.message);
    }
  }
);

// Increase product quantity
export const increaseProductQuantity = createAsyncThunk(
  "cart/increaseProductQuantity",
  async (cartId) => {
    try {
      const response = await axios.put(
        `${url}/cart/update/${cartId}/increase`,
        {},
        setHeaders()
      );
      toast.success(response.message, { position: "top-center" });
      return response.data;
    } catch (error) {
      toast.error(error.response?.message, { position: "top-center" });
      console.log("Failed to increase product quantity:", error.response.message);
    }
  }
);

// Clear cart
export const clearCart = createAsyncThunk("cart/clearCart", async () => {
  try {
    const response = await axios.delete(`${url}/cart/clear`, setHeaders());
    return response.data;
  } catch (error) {
    toast.error(error.response?.data, { position: "top-center" });
    throw error;
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addProductToCart.fulfilled, (state, action) => {
        state.status = "success"
        state.list = action.payload.data;

      })
      .addCase(addProductToCart.pending, (state) => {
        state.status = "pending";
      })
      .addCase(addProductToCart.rejected, (state) => {
        state.status = "rejected";
        state.list = []
      })
      .addCase(removeProductFromCart.fulfilled, (state, action) => {
        state.status = "success"
        state.list = action.payload;
  
      })
      .addCase(removeProductFromCart.pending, (state) => {
        state.status = "pending";
      })
      .addCase(removeProductFromCart.rejected, (state) => {
        state.status = "rejected";
      })
      .addCase(decreaseProductQuantity.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item.id !== action.payload.cart.id);
      })
      .addCase(decreaseProductQuantity.pending, (state) => {
        state.status = "pending";
      })
      .addCase(decreaseProductQuantity.rejected, (state) => {
        state.status = "rejected";
      })
      .addCase(increaseProductQuantity.fulfilled, (state, action) => {
        const updatedCart = state.list.map((item) =>
          item.id === action.payload.cart.id ? action.payload.cart : item
        );
        state.list = updatedCart;
      })
    
      .addCase(increaseProductQuantity.pending, (state) => {
        state.status = "pending";
      })
      .addCase(increaseProductQuantity.rejected, (state) => {
        state.status = "rejected";
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.status = "success"
        state.list = action.payload;
      
      })
      .addCase(clearCart.pending, (state) => {
        state.status = "pending";
      })
      .addCase(clearCart.rejected, (state) => {
        state.status = "rejected";
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.status = "success"
        state.list = action.payload;
      
      })
      .addCase(getCart.pending, (state) => {
        state.status = "pending";
      })
      .addCase(getCart.rejected, (state) => {
        state.status = "rejected";
        state.list = []
      });
  },
});

export default cartSlice.reducer;
