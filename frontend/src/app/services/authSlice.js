//authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

const initialState = {
    token: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
    isLoading: false,
    error: null,
};

// Login Action
export const login = createAsyncThunk(
    'auth/login',
    async ({email,password}, { rejectWithValue }) => {
        try {
            const response = await api.post('/v1/customer/login', {email,password});
            localStorage.setItem('access_token', response.data.data.access_token);
            localStorage.setItem('refresh_token', response.data.data.refresh_token);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Login failed' });
        }
    }
);

// Register Action
export const register = createAsyncThunk(
    'auth/register',
    async (registerationData, { rejectWithValue }) => {
        try {
            const response = await api.post('/v1/customer/register', registerationData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Registration failed' });
        }
    }
);

// Refresh Token Action
export const refreshAccessToken = createAsyncThunk(
    'auth/refresh',
    async (refreshToken, {rejectWithValue }) => {
        try {
            const response = await api.post('/v1/customer/refresh-token', null, {
                headers: { Authorization: `Bearer ${refreshToken}` },
            });
            localStorage.setItem('access_token', response.data.access_token);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Token refresh failed' });
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuth: (state, action) => {
            const { access_token, refreshToken } = action.payload;
            state.token = access_token;
            state.refreshToken = refreshToken;
        },
        logout: (state) => {
            state.token = null;
            state.refreshToken = null;
            state.error = null;
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        },
        clearError: (state) => {
            state.error = null;
        },
        resetAuthState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // LOGIN
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.token = action.payload.access_token;
                state.refreshToken = action.payload.refresh_token;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || 'Login failed';
            })

            // REGISTER
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || 'Registration failed';
            })

            // REFRESH TOKEN
            .addCase(refreshAccessToken.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(refreshAccessToken.fulfilled, (state, action) => {
                state.isLoading = false;
                state.token = action.payload.access_token;
                state.error = null;
            })
            .addCase(refreshAccessToken.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || 'Token refresh failed';
            });
    },
});

export const { setAuth, logout, clearError, resetAuthState } = authSlice.actions;

export default authSlice.reducer;
