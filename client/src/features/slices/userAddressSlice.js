/** @format */

// imports
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { setHeaders, url } from "./api";

// initial state
const initialState = {
	list: [],
	status: null,
	error: null
};

// Thunks
export const fetchusersAddress = createAsyncThunk(
	"usersAddress/fetchusersAddress",
	async (_, { rejectWithValue }) => {
		try {
			const response = await axios.get(`${url}/api/address`, { headers: setHeaders() });
			return response.data;
		} catch (error) {
			console.error("Error fetching usersAddress:", error.response?.message);
			toast.error(error.response?.data?.message || "Failed to fetch addresses", {
				position: "bottom-left",
			});
			return rejectWithValue(error.response?.data);
		}
	}
);

export const createUserAddress = createAsyncThunk(
	"usersAddress/createUserAddress",
	async (formData, { rejectWithValue }) => {
		try {
			const response = await axios.post(`${url}/address/get`, formData, { headers: setHeaders() });

			toast.success(response.data?.message, {
				position: "top-center",
			});

			return response.data;
		} catch (error) {
			console.error("Error creating UserAddress:", error.response?.data?.message || error.message);

			toast.error(error.response?.data?.message || "Failed to create address", {
				position: "bottom-left",
			});

			return rejectWithValue(error.response?.data);
		}
	}
);

export const deleteUserAddress = createAsyncThunk(
	"usersAddress/deleteUserAddress",
	async (UserAddressId, { rejectWithValue }) => {
		try {
			await axios.delete(`${url}/address/delete/${UserAddressId}`, { headers: setHeaders() });

			toast.success("Address deleted successfully", {
				position: "top-center",
			});

			return UserAddressId; // Return the deleted address ID
		} catch (error) {
			console.error("Error deleting UserAddress:", error.response?.message);
			toast.error(error.response?.data?.message || "Failed to delete address", {
				position: "top-center",
			});
			return rejectWithValue(error.response?.data);
		}
	}
);

export const updateUserAddress = createAsyncThunk(
	"usersAddress/updateUserAddress",
	async ({ addressId, values }, { rejectWithValue }) => {
		try {
			const response = await axios.put(`${url}/address/update/${addressId}`, values, { headers: setHeaders() });

			toast.success("Address updated successfully", {
				position: "top-center",
			});

			return response.data; // Assuming the server returns the updated UserAddress
		} catch (error) {
			console.error("Error updating UserAddress:", error.response?.message);
			toast.error(error.response?.data?.message || "Failed to update address", {
				position: "bottom-left",
			});
			return rejectWithValue(error.response?.data);
		}
	}
);

// Slice
const usersAddressSlice = createSlice({
	name: "addresses",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchusersAddress.pending, (state) => {
				state.status = "pending";
			})
			.addCase(fetchusersAddress.fulfilled, (state, action) => {
				state.list = action.payload;
				state.status = "success";
			})
			.addCase(fetchusersAddress.rejected, (state) => {
				state.status = "rejected";
			})
			.addCase(createUserAddress.pending, (state) => {
				state.status = "pending";
			})
			.addCase(createUserAddress.fulfilled, (state, action) => {
				state.list.push(action.payload);
				state.status = "success";
			})
			.addCase(createUserAddress.rejected, (state) => {
				state.status = "rejected";
			})
			.addCase(deleteUserAddress.pending, (state) => {
				state.status = "pending";
			})
			.addCase(deleteUserAddress.fulfilled, (state, action) => {
				state.list = state.list.filter((UserAddress) => UserAddress.id !== action.payload);
				state.status = "success";
			})
			.addCase(deleteUserAddress.rejected, (state) => {
				state.status = "rejected";
			})
			.addCase(updateUserAddress.pending, (state) => {
				state.status = "pending";
			})
			.addCase(updateUserAddress.fulfilled, (state, action) => {
				const updatedUserAddress = action.payload;
				const index = state.list.findIndex((UserAddress) => UserAddress.id === updatedUserAddress.id);
				if (index !== -1) {
					state.list[index] = updatedUserAddress;
				}
				state.status = "success";
			})
			.addCase(updateUserAddress.rejected, (state) => {
				state.status = "rejected";
			});
	},
});

export default usersAddressSlice.reducer;
