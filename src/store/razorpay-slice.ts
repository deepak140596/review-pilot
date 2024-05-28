import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RazorpayCredentials } from "../api/models/razorpay_credentials";
import { FirestoreService } from "../api/services/firestore/firestore-service";
import { DataState } from "./store";


export const initialStateForRazorpayCredentials: DataState<RazorpayCredentials> = {
    loading: false,
    error: null,
    data: null
}

export const getRazorpayCredentials = createAsyncThunk(
    "razorpay/getRazorpayCredentials",
    async (_, { dispatch }) => {
        const razorpayCredentials = await FirestoreService.getDocument<RazorpayCredentials>('admin', 'razorpay_test');
        dispatch(setRazorpayCredentials(razorpayCredentials));
    }
);

export const razorpayCredentialsSlice = createSlice({
    name: "razorpay",
    initialState: initialStateForRazorpayCredentials,
    reducers: {
        setRazorpayCredentials: (state: DataState<RazorpayCredentials>, action: PayloadAction<RazorpayCredentials>) => {
            state.loading = false;
            state.error = null;
            state.data = action.payload;
        }
    }
});

export const { setRazorpayCredentials } = razorpayCredentialsSlice.actions;