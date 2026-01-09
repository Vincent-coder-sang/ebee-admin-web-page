/** @format */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { setHeaders, url } from "./api";

const initialState = {
	list: [],
	status: null,
	error: null
};

// Thunks
export const fetchNotifications = createAsyncThunk(
	"notifications/fetchNotifications",
	async (userId, { rejectWithValue }) => {
		try {
			const response = await axios.get(
				`${url}/notifications/get/${userId}`,
				setHeaders()
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching notifications:", error.response?.message);
			toast.error(error.response?.data, {
				position: "bottom-left",
			});
			return rejectWithValue(error.response.data);
		}
	}
);

export const fetchAllNotifications = createAsyncThunk(
	"notifications/fetchAllNotifications",
	async (_, { rejectWithValue }) => {
		try {
			const response = await axios.get(
				`${url}/notifications/get`,
				setHeaders()
			);
			return response.data;
		} catch (error) {
			console.error(
				"Error fetching all notifications:",
				error.response?.message
			);
			toast.error(error.response?.data, {
				position: "bottom-left",
			});
			return rejectWithValue(error.response.data);
		}
	}
);

export const markNotificationAsRead = createAsyncThunk(
	"notifications/markNotificationAsRead",
	async (notificationId, { rejectWithValue }) => {
		try {
			const response = await axios.put(
				`${url}/notifications/marked/${notificationId}`,
				{},
				setHeaders()
			);
			return response.data;
		} catch (error) {
			console.error(
				"Error marking notification as read:",
				error.response?.message
			);
			toast.error(error.response?.data, {
				position: "bottom-left",
			});
			return rejectWithValue(error.response.data);
		}
	}
);

// Slice
const notificationsSlice = createSlice({
	name: "notifications",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchNotifications.fulfilled, (state, action) => {
				state.list = action.payload;
				state.status = "success";
			})
			.addCase(fetchNotifications.pending, (state) => {
				state.status = "pending";
			})
			.addCase(fetchNotifications.rejected, (state) => {
				state.status = "rejected";
			})
			.addCase(fetchAllNotifications.fulfilled, (state, action) => {
				state.list = action.payload;
				state.status = "success";
			})
			.addCase(fetchAllNotifications.pending, (state) => {
				state.status = "pending";
			})
			.addCase(fetchAllNotifications.rejected, (state) => {
				state.status = "rejected";
			})
			.addCase(markNotificationAsRead.fulfilled, (state, action) => {
				const updatedNotification = action.payload;
				const index = state.list.findIndex(
					(notification) => notification.id === updatedNotification.id
				);
				if (index !== -1) {
					state.list[index] = updatedNotification;
				}
				state.status = "success";
			})
			.addCase(markNotificationAsRead.pending, (state) => {
				state.status = "pending";
			})
			.addCase(markNotificationAsRead.rejected, (state) => {
				state.status = "rejected";
			});
	},
});

export default notificationsSlice.reducer;
