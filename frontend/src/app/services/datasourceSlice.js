// datasourceSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

// Initial state
const initialState = {
    db_configs: [],
    user_docs: [],
    isLoading: false,
    error: null,
};

// Async thunk to fetch datasource
export const getDatasource = createAsyncThunk(
    "datasource/getDatasource",
    async ({ token }, { rejectWithValue }) => {
        try {
            const response = await api.get('/v1/datasource/', {
                params: { token },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || "Failed to get datasource",
                status: error.response?.status || 500,
            });
        }
    }
);

// Slice
const datasourceSlice = createSlice({
    name: "datasource",
    initialState,
    reducers: {
        // Reset error
        resetError(state) {
            state.error = null;
        },
        // Reset state
        resetState(state) {
            Object.assign(state, initialState);
        },
    },
    extraReducers: (builder) => {
        builder
            // Handle getDatasource
            .addCase(getDatasource.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getDatasource.fulfilled, (state, action) => {
                state.isLoading = false;
                state.db_configs = action.payload?.db_configs || [];
                state.user_docs = action.payload?.user_docs || [];
            })
            .addCase(getDatasource.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Failed to get datasource";
            });
    },
});

// Export actions and reducer
export const { resetError, resetState } = datasourceSlice.actions;
export default datasourceSlice.reducer;
