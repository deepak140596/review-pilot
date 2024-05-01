import { createAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { StripeConfig } from "../api/models/stripe";
import { DataState } from "./store";
import { FirestoreService } from "../api/services/firestore/firestore-service";
import { uid } from "../context/auth-context";


export const setStripeConfig = createAction<StripeConfig>("stripe/setStripeConfig");
export const setErrorWhileGettingStripeConfig = createAction<string | null>("stripe/setErrorWhileGettingStripeConfig");
export const setCheckoutUrl = createAction<string | null>("stripe/setCheckoutUrl");

export const initialStateForStripeConfig: DataState<StripeConfig> = {
    loading: false,
    error: null,
    data: null
}

export const initialStateForCheckoutUrl: DataState<string> = {
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

export const createStripeCheckoutSession = createAsyncThunk(
    "stripe/createStripeCheckoutSession",
    async ({ priceId, successUrl, cancelUrl }: { priceId: string, successUrl: string, cancelUrl: string }, { dispatch }) => {
        const checkoutDoc = await FirestoreService.addDocument(`users/${uid()}/checkout_sessions`, {
            price: priceId,
            success_url: successUrl,
            cancel_url: cancelUrl
        })
        const checkoutDocRef = `users/${uid()}/checkout_sessions/${checkoutDoc.id}`;
        FirestoreService.listenToDocument<any>(checkoutDocRef, (checkoutSession) => {
            if (checkoutSession.url) {
                console.log(`Checkout URL: ${checkoutSession.url}`)
                dispatch(setCheckoutUrl(checkoutSession.url));
            }
        })
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

export const checkoutUrlSlice = createSlice({
    name: "checkoutUrl",
    initialState: initialStateForCheckoutUrl,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(setCheckoutUrl, (state: DataState<string>, action: any) => {
            state.loading = false;
            state.error = null;
            state.data = action.payload;
        });
    }
});