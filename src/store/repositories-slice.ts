import { createAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { FirestoreService } from "../api/services/firestore/firestore-service";
import { Repository } from "../api/models/repository";
import { where } from "firebase/firestore";

export const setRepositories = createAction<Repository[]>("repositories/setRepositories");
export const setErrorWhileGettingRepositories = createAction<string | null>("repositories/setError");

const initialState = {
    loading: false,
    error: null,
    repositories: []
}

export const subscribeToRepositories = createAsyncThunk(
    "repositories/subsribeToRepositories",
    async (accountId: string, { dispatch }) => {
        FirestoreService.listenToQueryCollection<Repository>(
            "repositories",
            (repositories) => {
                dispatch(setRepositories(repositories));
            },
            (error) => {
                dispatch(setErrorWhileGettingRepositories(error.message));
            },
            where("account_id", "==", accountId)
        );
    }
);


export const repositoriesSlice = createSlice({
    name: "repositories",
    initialState,
    reducers: {},
    extraReducers: (builder: any) => {
        builder
        .addCase(setRepositories, (state: any, action: any) => {
            state.repositories = action.payload;
            state.loading = false;
            state.error = null;
        })
        .addCase(setErrorWhileGettingRepositories, (state: any, action: any) => {
            state.error = action.payload;
            state.loading = false;
        })
    }
})

export default repositoriesSlice.reducer;