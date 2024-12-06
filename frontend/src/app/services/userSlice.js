//userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

const initialState = {
    uuid: null,
    name: null,
    email: null,
    isLoading: false,
    error: null,
};

// Get User Info
export const getUserInfo = createAsyncThunk(
    "user/getUserInfo",
    async (token, { rejectWithValue }) => {
        try {
            const response = await api.get(`/v1/customer/profile?token=${token}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to fetch user info" });
        }
    }
);

// Edit User Info
export const editUserInfo = createAsyncThunk(
    "user/editUserInfo",
    async ({ token, userData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/v1/customer/profile?token=${token}`, userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to edit user info" });
        }
    }
);

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        resetError(state) {
            state.error = null;
        },
        resetUserState:(state)=>{
            state.uuid = null;
            state.name = null;
            state.email = null;
            state.isLoading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Handle getUserInfo
            .addCase(getUserInfo.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getUserInfo.fulfilled, (state, action) => {
                state.isLoading = false;
                state.uuid = action.payload?.uuid || null;
                state.name = action.payload?.name || null ;
                state.email = action.payload?.email || null;
            })
            .addCase(getUserInfo.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Something went wrong";
            })
            // Handle editUserInfo
            .addCase(editUserInfo.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(editUserInfo.fulfilled, (state, action) => {
                state.isLoading = false;
                state.name = action.payload?.name || state.name;
                state.email = action.payload?.email || state.email;
            })
            .addCase(editUserInfo.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Something went wrong";
            });
    },
});

export const { resetError,resetUserState } = userSlice.actions;

export default userSlice.reducer;
