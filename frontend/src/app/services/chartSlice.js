// chartSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

const initialState = {
    history: {
      messages: [], // Ensure it's initialized as an array
      query_type: "",
      title: "",
    },
    chartData: null, // Separate field for chart-specific data
    isLoading: false,
    error: null,
  };
  
  // Async thunk to get chart by UUID
  export const getChart = createAsyncThunk(
    "chart/getChart",
    async ({ token, chart_uuid }, { rejectWithValue }) => {
      try {
        const response = await api.get(`/v1/chart/${chart_uuid}?token=${token}`);
        console.log("the response from the getChaart", response.data.data);
        return response.data.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || { message: "Failed to fetch chart data" });
      }
    }
  );
  
  // Async thunk to get chart history by chat UUID
  export const getChartByChat = createAsyncThunk(
    "chart/getChartByChat",
    async ({ token, chat_uuid }, { rejectWithValue }) => {
      try {
        const response = await api.get(`/v1/chart/chat/${chat_uuid}?token=${token}`);
        console.log("the response from the getChaart", response.data);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || { message: "Failed to fetch chat history" });
      }
    }
  );
  
  const chartSlice = createSlice({
    name: "chart",
    initialState,
    reducers: {
      clearChartError: (state) => {
        state.error = null;
      },
    },
    extraReducers: (builder) => {
      builder
        // Handle getChart actions
        .addCase(getChart.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(getChart.fulfilled, (state, action) => {
          state.isLoading = false;
          state.chartData = action.payload; // Store chart-specific data
        })
        .addCase(getChart.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload?.message || "Failed to fetch chart data";
        })
        // Handle getChartByChat actions
        .addCase(getChartByChat.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(getChartByChat.fulfilled, (state, action) => {
          state.isLoading = false;
          state.history = action.payload; // Store chat history
        })
        .addCase(getChartByChat.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload?.message || "Failed to fetch chat history";
        });
    },
  });
  

export const { clearChartError } = chartSlice.actions;

export default chartSlice.reducer;
