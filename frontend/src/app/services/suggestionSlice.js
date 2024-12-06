// suggestionSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

// Initial state
const initialState = {
    suggestions: [
        "What is artificial intelligence?",
        "How do you calculate the standard deviation?",
        "What is a variance?",
    ],
    isLoading: false,
    error: null,
};

// Async thunk to fetch suggestions
export const getSuggestions = createAsyncThunk(
    "suggestion/getSuggestions",
    async ({token,suggestionQuery}, { rejectWithValue }) => {
        try {
            const response = await api.post(`/v1/suggestion?token=${token}`,suggestionQuery);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: "Failed to fetch suggestions" }
            );
        }
    }
);

// Suggestion slice
const suggestionSlice = createSlice({
    name: "suggestion",
    initialState,
    reducers: {
        // Reset error state
        resetError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getSuggestions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getSuggestions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.suggestions = action.payload.suggestions;
            })
            .addCase(getSuggestions.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    action.payload?.message || "Failed to fetch suggestions";
            });
    },
});

// Export actions and reducer
export const { resetError } = suggestionSlice.actions;
export default suggestionSlice.reducer;
