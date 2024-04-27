import { createAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { FirestoreService } from "../api/services/firestore/firestore-service";
import { Account } from "../api/models/account";
import { DataState } from "./store";
import { uid } from "../context/auth-context";

export const setOrganisation = createAction<Account>("account/setOrganisation");
export const setErrorWhileGettingOrganisation = createAction<string | null>("account/setErrorWhileGettingOrganisation");
export const setUserAccount = createAction<Account>("account/setUserAccount");
export const setUserAccountError = createAction<string | null>("account/setUserAccountError");

export const initialStateForOrganisation: DataState<Account> = {
    loading: false,
    error: null,
    data: null
}

export const initialStateForUserAccount: DataState<Account> = {
    loading: false,
    error: null,
    data: null
}

export const subscribeToOrganisation = createAsyncThunk(
    "account/subscribeToOrganisation",
    async (accountId: string, { dispatch }) => {
        FirestoreService.listenToDocument<Account>(
            `organisations/${accountId}`,
            (organisation) => {
                dispatch(setOrganisation(organisation));
            },
            (error) => {
                dispatch(setErrorWhileGettingOrganisation(error.message));
            }
        );
    }
);

export const subscribeToUserAccount = createAsyncThunk(
    "account/subscribeToUserAccount",
    async (_,{ dispatch }) => {
        FirestoreService.listenToDocument<Account>(
            `users/${uid()}`,
            (userAccount) => {
                dispatch(setUserAccount(userAccount));
            },
            (error) => {
                dispatch(setUserAccountError(error.message));
            }
        );
    }
);

export const organisationSlice = createSlice({
    name: "organisation",
    initialState: initialStateForOrganisation,
    reducers: {},
    extraReducers: (builder: any) => {
        builder.addCase(setOrganisation, (state: DataState<Account>, action: any) => {
            state.loading = false;
            state.error = null;
            state.data = action.payload;
        });
        builder.addCase(setErrorWhileGettingOrganisation, (state: DataState<Account>, action: any) => {
            state.loading = false;
            state.error = action.error.message;
        });
    }
});

export const userAccountSlice = createSlice({
    name: "userAccount",
    initialState: initialStateForUserAccount,
    reducers: {},
    extraReducers: (builder: any) => {
        builder.addCase(setUserAccount, (state: DataState<Account>, action: any) => {
            state.loading = false;
            state.error = null;
            state.data = action.payload;
        });
        builder.addCase(setUserAccountError, (state: DataState<Account>, action: any) => {
            state.loading = false;
            state.error = action.error.message;
        });
    }
});