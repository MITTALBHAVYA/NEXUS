// querySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

// Initial state
const initialState = {
    divResponse: null,
    sqlQuery: null,
    isLoading: false,
    error: null,
    chart_uuid:null
};

// Async thunk to handle query requests
export const postQuery = createAsyncThunk(
    "query/postQuery",
    async ({ token, requiredData }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/v1/query?token=${token}`, requiredData );
            console.log("postQuesy result are : ",response.data.data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: "Failed to fetch query data" }
            );
        }
    }
);

// Async thunk for version 1 of query API
export const postQueryv1 = createAsyncThunk(
    "query/postQueryv1",
    async ({ token, query_type, requiredData }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/v1/query/${query_type}?token=${token}`, requiredData );
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: "Failed to fetch query data" }
            );
        }
    }
);

// Async thunk for version 2 of query API
export const postQueryv2 = createAsyncThunk(
    "query/postQueryv2",
    async ({ token, requiredData }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/v2/query/csv?token=${token}`, requiredData );
            console.log("postQuery2 result are from slice : ",response.data.data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: "Failed to fetch query data" }
            );
        }
    }
);

// Query slice
const querySlice = createSlice({
    name: "query",
    initialState,
    reducers: {
        // Reset error state
        resetError(state) {
            state.error = null;
        },
        // Reset state to initial state
        resetQueryState(state) {
            state.divResponse = null;
            state.sqlQuery = null;
            state.isLoading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Handle postQuery
            .addCase(postQuery.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(postQuery.fulfilled, (state, action) => {
                state.isLoading = false;
                state.divResponse = action.payload.response || null;
                state.sqlQuery = action.payload.sql_query || null;
                state.chart_uuid = action.payload.chart_uuid || null;
            })
            .addCase(postQuery.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Failed to fetch query data";
            })

            // Handle postQueryv1
            .addCase(postQueryv1.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(postQueryv1.fulfilled, (state, action) => {
                state.isLoading = false;
                state.divResponse = action.payload.response || null;
                state.sqlQuery = action.payload.sql_query || null;
                state.chart_uuid = action.payload.chart_uuid || null;
            })
            .addCase(postQueryv1.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Failed to fetch query data";
            })

            // Handle postQueryv2
            .addCase(postQueryv2.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(postQueryv2.fulfilled, (state, action) => {
                state.isLoading = false;
                state.divResponse = action.payload.response || null;
                state.sqlQuery = action.payload.sql_query || null;
                state.chart_uuid = action.payload.chart_uuid || null;
            })
            .addCase(postQueryv2.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Failed to fetch query data";
            });
    },
});

// Export actions and reducer
export const { resetError, resetQueryState } = querySlice.actions;
export default querySlice.reducer;
