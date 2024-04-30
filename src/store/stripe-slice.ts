import { createAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { StripeConfig } from "../api/models/stripe";
import { DataState } from "./store";
import { FirestoreService } from "../api/services/firestore/firestore-service";


export const setStripeConfig = createAction<StripeConfig>("stripe/setStripeConfig");
export const setErrorWhileGettingStripeConfig = createAction<string | null>("stripe/setErrorWhileGettingStripeConfig");

export const initialStateForStripeConfig: DataState<StripeConfig> = {
    loading: false,
    error: null,
    data: null
}

export const getStripeConfig = createAsyncThunk(
    "stripe/getStripeConfig",
    async (_, { dispatch }) => {
        const stripeConfig = await FirestoreService.getDocument<StripeConfig>('admin', 'stripe_test');
        dispatch(setStripeConfig(stripeConfig));
    }
);

export const stripeConfigSlice = createSlice({
    name: "stripe",
    initialState: initialStateForStripeConfig,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(setStripeConfig, (state: DataState<StripeConfig>, action: any) => {
            state.loading = false;
            state.error = null;
            state.data = action.payload;
        });
    }
});