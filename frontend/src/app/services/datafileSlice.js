// datafileSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

// Initial state
const initialState = {
    document_id: 0,
    document_name: null,
    document_type: null,
    chat_uuid: null,
    isLoading: false,
    created_at: null,
    error: null,
};

// Async thunk for uploading a Data file
export const uploadDataFile = createAsyncThunk(
    "datafile/uploadDataFile",
    async ({ token, formData, file_type }, { rejectWithValue }) => {
        try {
            
            const response = await api.post(
                `/v1/${file_type}/upload`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    params: {
                        token, 
                    },
                }
            );

            console.log("Uploaded file response data:", response.data?.data);
            return response.data?.data;
        } catch (error) {
            console.error("Error uploading file:", error);
            return rejectWithValue(
                error.response?.data || { message: `Failed to upload ${file_type} file` }
            );
        }
    }
);

// Async thunk for fetching Data File details
export const getDataFiledetails = createAsyncThunk(
    "datafile/getDataFileDetails",
    async ({ token, document_id, file_type }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/v1/${file_type}/${document_id}?token=${token}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: `Failed to fetch ${file_type} Details` }
            );
        }
    }
);

// Async thunk for updating the DATA File name
export const updateDataFilename = createAsyncThunk(
    "datafile/updateDataFilename",
    async ({ token, document_id, document_name, file_type }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/v1/${file_type}/${document_id}?token=${token}`, { document_name });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: `Failed to update ${file_type} Name` }
            );
        }
    }
);

// Async thunk for deleting a DATA file
export const deleteDataFile = createAsyncThunk(
    "datafile/deleteDataFile",
    async ({ token, document_id, file_type }, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/v1/${file_type}/${document_id}?token=${token}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: `Failed to delete ${file_type}` }
            );
        }
    }
);

// Async thunk for downloading a DATA file
export const downloadDataFile = createAsyncThunk(
    "datafile/downloadDataFile",
    async ({ token, document_id, file_type }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/v1/${file_type}/download/${document_id}?token=${token}`);
            const blob = await response.blob();
            return blob;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: `Failed to download ${file_type}` }
            );
        }
    }
)

const datafileSlice = createSlice({
    name: "datafile",
    initialState,
    reducers: {
        resetError(state) {
            state.error = null;
        },
        resetDataFileState: (state) => {
            state.document_id = 0;
            state.document_name = null;
            state.document_type = null;
            state.chat_uuid = null;
            state.isLoading = false;
            state.created_at = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Handle uploadCSV
            .addCase(uploadDataFile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(uploadDataFile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.document_id = action.payload?.document_id || 0;
                state.document_name = action.payload?.document_name || null;
                state.document_type = action.payload?.document_type || null;
                state.chat_uuid = action.payload?.chat_uuid || null;
                state.created_at = action.payload?.created_at || null;
            })
            .addCase(uploadDataFile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Something went wrong!";
            })

            // Handle getDataFiledetails
            .addCase(getDataFiledetails.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getDataFiledetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.document_id = action.payload.document_id;
                state.document_name = action.payload.document_name;
                state.document_type = action.payload.document_type;
                state.chat_uuid = action.payload.chat_uuid;
                state.created_at = action.payload?.created_at || null;
            })
            .addCase(getDataFiledetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Something went wrong!";
            })

            // Handle updateDataFilename
            .addCase(updateDataFilename.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateDataFilename.fulfilled, (state, action) => {
                state.isLoading = false;
                if (state.document_id === action.meta.arg.document_id) {
                    state.document_name = action.payload?.document_name || state.document_name;
                }
            })
            .addCase(updateDataFilename.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Something went wrong!";
            })

            // Handle deleteDataFile
            .addCase(deleteDataFile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteDataFile.fulfilled, (state, action) => {
                state.isLoading = false;
                if (state.document_id === action.meta.arg.document_id) {
                    state.document_id = 0;
                    state.document_name = null;
                    state.document_type = null;
                    state.chat_uuid = null;
                    state.created_at = null;
                }
            })
            .addCase(deleteDataFile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Something went wrong!";
            });
    },
});

export const { resetError, resetDataFileState } = datafileSlice.actions;

export default datafileSlice.reducer;
