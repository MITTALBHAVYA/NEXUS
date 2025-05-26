import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

const initialState = {
    customer_uuid: null,
    allhistory: {
        db: [],
        doc: [],
        chat: [],
    },
    chatHistory : {
        chat_uuid : null,
        history : {
            title:null,
            query_type:null,
            messages : [],
        }
    },
    isLoading: false,
    error: null,
};

// Async thunk to get all chat history
export const getAllChatHistory = createAsyncThunk(
    'chat/getAllChatHistory',
    async (token, { rejectWithValue }) => {
        try {
            const response = await api.get(`/v1/chat/?token=${token}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to fetch chat info" });
        }
    }
);

// Async thunk to get specific chat history
export const getChatHistory = createAsyncThunk(
    'chat/getChatHistory',
    async ({ token, chat_uuid }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/v1/chat/${chat_uuid}?token=${token}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to fetch chat info" });
        }
    }
);

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setCustomerUUID: (state, action) => {
            state.customer_uuid = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Handle getAllChatHistory actions
            .addCase(getAllChatHistory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getAllChatHistory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.allhistory.chat = action.payload.history.chat;
                state.allhistory.db = action.payload.history.db;
                state.allhistory.doc = action.payload.history.doc;
                state.customer_uuid = action.payload.customer_uuid;
            })
            .addCase(getAllChatHistory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Failed to fetch chat info";
            })
            // Handle getChatHistory actions
            .addCase(getChatHistory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getChatHistory.fulfilled, (state,action) => {
                state.isLoading = false;
                state.customer_uuid = action.payload.customer_uuid;
                state.chatHistory.chat_uuid = action.payload.chat_uuid;
                state.chatHistory.history = action.payload.history;
                // state.history.chat = action.payload.chat;
            })
            .addCase(getChatHistory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Failed to fetch specific chat info";
            });
    },
});

export const { setCustomerUUID, clearError } = chatSlice.actions;

export default chatSlice.reducer;
