// llmSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

// Initial state
const initialState = {
    llmModels: [],
    isLoading: false,
    error: null,
};

// Async thunk to fetch LLM models
export const getLlmModels = createAsyncThunk(
    "llm/getLlmModels",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`/v1/llm_models/`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: "Failed to fetch LLM models" }
            );
        }
    }
);

// Slice for LLM models
const llmSlice = createSlice({
    name: "llm",
    initialState,
    reducers: {
        resetError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getLlmModels.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getLlmModels.fulfilled, (state, action) => {
                state.isLoading = false;
                state.llmModels = action.payload.data;
            })
            .addCase(getLlmModels.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Failed to fetch LLM models";
            });
    },
});

// Export actions and reducer
export const { resetError } = llmSlice.actions;
export default llmSlice.reducer;
