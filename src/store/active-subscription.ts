import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ActiveSubscription } from "../api/models/active_subscription";
import { DataState } from "./store";
import { FirestoreService } from "../api/services/firestore/firestore-service";
import { limit, where } from "firebase/firestore";

const initialStateForActiveSubscription: DataState<ActiveSubscription> = {
    loading: false,
    error: null,
    data: null
}

export const getActiveSubscription = createAsyncThunk(
    "activeSubscription/getActiveSubscription",
    async (userId: string, { dispatch }) => {
        FirestoreService.listenToQueryCollection<ActiveSubscription>(
            `users/${userId}/subscriptions`, 
            (activeSubscription) => {
                if (activeSubscription.length > 0) {
                    dispatch(setActiveSubscription(activeSubscription[0]));
                }
            },
            (error) => {
                dispatch(setErrorWhileGettingActiveSubscription(error.message));
            },
            where('active', '==', true),
            limit(1)
            
        );
    }
);

export const activeSubscriptionSlice = createSlice({
    name: "activeSubscription",
    initialState: initialStateForActiveSubscription,
    reducers: {
        setActiveSubscription: (state: DataState<ActiveSubscription>, action: PayloadAction<ActiveSubscription>) => {
            state.loading = false;
            state.error = null;
            state.data = action.payload;
        },
        setErrorWhileGettingActiveSubscription: (state: DataState<ActiveSubscription>, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        setLoadingActiveSubscription: (state: DataState<ActiveSubscription>, action: PayloadAction<boolean>) => {
            state.loading = true;
            state.error = null;
            state.data = null;
        }
    }
});

export const { setActiveSubscription, setErrorWhileGettingActiveSubscription, setLoadingActiveSubscription } = activeSubscriptionSlice.actions;