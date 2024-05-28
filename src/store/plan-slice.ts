import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Plans } from "../api/models/plan";
import { FirestoreService } from "../api/services/firestore/firestore-service";
import { DataState } from "./store";


const initialStateForPlans: DataState<Plans> = {
    loading: false,
    error: null,
    data: null
}

export const getPlans = createAsyncThunk(
    "plan/getPlans",
    async (_, { dispatch }) => {
        const plans = await FirestoreService.getDocument<Plans>('admin', 'plans');
        dispatch(setPlans(plans));
    }
);

export const plansSlice = createSlice({
    name: "plans",
    initialState: initialStateForPlans,
    reducers: {
        setPlans: (state: DataState<Plans>, action: PayloadAction<Plans>) => {
            state.loading = false;
            state.error = null;
            state.data = action.payload;
        },
        setErrorWhileGettingPlans: (state: DataState<Plans>, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        setLoadingPlans: (state: DataState<Plans>, action: PayloadAction<boolean>) => {
            state.loading = true;
            state.error = null;
            state.data = null;
        }
    }
});

export const { setPlans, setErrorWhileGettingPlans, setLoadingPlans } = plansSlice.actions;