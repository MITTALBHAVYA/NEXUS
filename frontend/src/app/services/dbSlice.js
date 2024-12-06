//dbSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

const initialState = {
    db_configs: [],
    db_config_id: null,
    chat_uuid: null,
    customer_uuid: null,
    testStatus: null,
    isLoading: false,
    error: null,
};

// Async thunk for creating a DB configuration
export const createDBconfig = createAsyncThunk(
    "db/createDBconfig",
    async ({ token, requiredConfig }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/v1/db-operation/create?token=${token}`, requiredConfig);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to create DB config" });
        }
    }
);

// Async thunk for fetching DB configurations
export const getDBconfig = createAsyncThunk(
    "db/getDBconfig",
    async (token, { rejectWithValue }) => {
        try {
            const response = await api.get(`/v1/db-operation/?token=${token}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to get DB config" });
        }
    }
);

// Async thunk for updating a DB configuration
export const updateDBconfig = createAsyncThunk(
    "db/updateDBconfig",
    async ({ token, db_config_id, requiredConfig }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/v1/db-operation/${db_config_id}?token=${token}&&db_config_id=${db_config_id}`, requiredConfig);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to update DB config" });
        }
    }
);

// Async thunk for deleting a DB configuration
export const deleteDBconfig = createAsyncThunk(
    "db/deleteDBconfig",
    async ({ token, db_config_id }, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/v1/db-operation/${db_config_id}?token=${token}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to delete DB config" });
        }
    }
);

// Async thunk for testing a DB configuration
export const testDBconfig = createAsyncThunk(
    "db/testDBconfig",
    async ({ token, requiredConfig }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/v1/db-operation/test-connection?token=${token}`, requiredConfig);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to test DB config" });
        }
    }
);

const dbSlice = createSlice({
    name: "db",
    initialState,
    reducers: {
        resetError(state) {
            state.error = null;
        },
        resetDBState: (state) => {
            state.db_configs = [];
            state.customer_uuid = null;
            state.isLoading = false;
            state.error = null;
            state.testStatus = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Handle createDBconfig
            .addCase(createDBconfig.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createDBconfig.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(createDBconfig.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Something went wrong in Creating DB Config!";
            })

            // Handle getDBconfig
            .addCase(getDBconfig.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getDBconfig.fulfilled, (state, action) => {
                state.isLoading = false;
                state.db_configs = action.payload.db_configs || [];
                state.customer_uuid = action.payload.customer_uuid || null;
            })
            .addCase(getDBconfig.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Something went wrong in getting DB configs!";
            })

            // Handle updateDBconfig
            .addCase(updateDBconfig.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateDBconfig.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(updateDBconfig.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Something went wrong in updating DB Config!";
            })

            // Handle deleteDBconfig
            .addCase(deleteDBconfig.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteDBconfig.fulfilled, (state, action) => {
                state.isLoading = false;
                const deletedId = action.meta.arg.db_config_id; // Get the deleted config ID
                state.db_configs = state.db_configs.filter((config) => config.db_config_id !== deletedId);
            })
            .addCase(deleteDBconfig.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Something went wrong in deleting DB config!";
            })            

            // Handle testDBconfig
            .addCase(testDBconfig.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.testStatus = null;
            })
            .addCase(testDBconfig.fulfilled, (state, action) => {
                state.isLoading = false;
                state.testStatus = action.payload?.status || "success";
            })
            .addCase(testDBconfig.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Something went wrong in testing DB config!";
                state.testStatus = "failed";
            });
    },
});

export const { resetError, resetDBState } = dbSlice.actions;

export default dbSlice.reducer;
