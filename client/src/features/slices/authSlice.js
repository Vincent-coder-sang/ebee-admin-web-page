import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import { url } from "./api";
import { toast } from "react-toastify";

// Initial state for the auth slice
const initialState = {
  token: localStorage.getItem("token") || null,
  phoneNumber: "",
  email: "",
  name: "",
  id: "",
  userType: null,
  registerStatus: "",
  registerError: "",
  loginStatus: "",
  loginError: "",
  userLoaded: false,
  isApproved: false,
};
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (values, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${url}/auth/signup`, {
        email: values.email,
        phoneNumber: values.phoneNumber,
        name: values.name,
        password: values.password,
      });
      
      toast.success(response.data.message,  {
        position: "top-center"
      });

      // Return only the necessary information (e.g., user details)
      return { userData: response.data.data, message: response.data.message };
    } catch (error) {
      console.error(error.response.data.message);
      toast.error(error.response.data.message,  {
        position: "top-center"
      } );
      return rejectWithValue(error.response.data.message);
    }
  }
);

  // Async thunk for user login
  export const loginUser = createAsyncThunk(
	"auth/loginUser",
	async (values, { rejectWithValue }) => {
	  try {
		const response = await axios.post(`${url}/auth/login`, {
		  email: values.email,
		  password: values.password,
		});

    	const token = response.data.token;
    localStorage.setItem("token", token); 
  
		toast.success(response.data.message, {
      position: "top-center"
    });
		return token;
	  } catch (error) {
	
		toast.error(error.response.data.message,  {
      position: "top-center"
    });
		return rejectWithValue(error.response.data.message);
	  }
	}
  );
  

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loadUser(state) {
      const token = state.token;
      if (token) {
        try {
          const user = jwtDecode(token);
          return {
            ...state,
            phoneNumber: user.phoneNumber || "",
            email: user.email || "",
            name: user.name || "",
            id: user.id || "",
            userType: user.userType || null,
            isApproved: user.isApproved || false,
            userLoaded: true,
          };
        } catch (error) {
          console.error("Token decoding error in loadUser:", error);
          localStorage.removeItem("token");
          return { ...initialState, userLoaded: true };
        }
      } else {
        return { ...state, userLoaded: true };
      }
    },
    logoutUser(state) {
      localStorage.removeItem("token");
      return {
        ...state,
        token: "",
        phoneNumber: "",
        email: "",
        name: "",
        id: "",
        userType: null,
        registerStatus: "",
        registerError: "",
        loginStatus: "",
        loginError: "",
        userLoaded: false,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
      return {...state, registerStatus: "pending"};
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        const userData = action.payload.userData;
        if (userData) {
          return {
            ...state,
            phoneNumber: userData.phoneNumber,
            email: userData.email,
            name: userData.name,
            id: userData.id,
            userType: userData.userType,
            isApproved: userData.isApproved,
            registerStatus: "success",
          };
        }
        return state;
      })
      .addCase(registerUser.rejected, (state, action) => {

        return {
          ...state,
          registerStatus: "rejected",
          registerError: action.payload,
        };
      })
      .addCase(loginUser.pending, (state) => {
       return  {...state, loginStatus: "pending"}
      })
      .addCase(loginUser.fulfilled, (state, action) => {

        if (action.payload) {
          const user = jwtDecode(action.payload);
          return {
            ...state,
            token: action.payload,
            phoneNumber: user.phoneNumber,
            name: user.name,
            email: user.email,
            id: user.id,
            userType: user.userType,
            loginStatus: "success",
          };
        }
        return state;
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.log("action", action)

        return {
          ...state,
          loginStatus: "rejected",
          loginError: action.payload,
        };
      })

  },
});

export const { loadUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;