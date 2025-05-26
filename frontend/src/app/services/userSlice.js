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
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await api.get(`/v1/customer/profile?token=${token}`, config);
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
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            // userData is the body of the PUT request
            const response = await api.put(`/v1/customer/profile?token=${token}`, userData, config);
            // Assuming response.data is APIResponseBase { success, message, data: updatedUserData }
            return response.data; // This will be the APIResponseBase object
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
                state.error = action.payload?.message || "Something went wrong fetching user info";
            })
            // Handle editUserInfo
            .addCase(editUserInfo.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(editUserInfo.fulfilled, (state, action) => {
                state.isLoading = false;
                // action.payload is the APIResponseBase object, so updated user data is in action.payload.data
                state.name = action.payload?.data?.name || state.name;
                state.email = action.payload?.data?.email || state.email;
                // Optionally update other fields if they are returned and relevant
                state.uuid = action.payload?.data?.uuid || state.uuid;
            })
            .addCase(editUserInfo.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Something went wrong editing user info";
            });
    },
});

export const { resetError,resetUserState } = userSlice.actions;

export default userSlice.reducer;
