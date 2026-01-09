/** @format */
import { configureStore } from "@reduxjs/toolkit";

import usersReducer from "./slices/usersSlice";
import productReducer from "./slices/productSlice";
import ordersReducer from "./slices/orderSlice";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import feedbackReducer from "./slices/feedbackSlice";
import userAddressReducer from "./slices/userAddressSlice";
import dispatchReducer from "./slices/dispatchSlice"
import rentalReducer from "./slices/rentalSlice";
import bookingReducer from "./slices/bookingSlice"
import fineReducer from "./slices/fineSlice";
import inventoryReducer from "./slices/inventorySlice";
import reportReducer from "./slices/reportSlice";
import servicesReducer from "./slices/serviceSlice";

const store = configureStore({
  reducer: {
    // Start with just one reducer, then add others one by one
    auth: authReducer,
    users: usersReducer,
    products: productReducer,
    orders: ordersReducer,
    cart: cartReducer,
    feedbacks: feedbackReducer,
    addresses: userAddressReducer,
    dispatches: dispatchReducer,
    rentals: rentalReducer,
    bookings: bookingReducer,
    fines: fineReducer,
    inventory: inventoryReducer,
    reports: reportReducer,
    services: servicesReducer,
  },
});

export default store;