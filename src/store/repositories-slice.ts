import { createAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { FirestoreService } from "../api/services/firestore/firestore-service";
import { Repository } from "../api/models/repository";
import { where } from "firebase/firestore";
import { DataState } from "./store";

export const setRepositories = createAction<Repository[]>("repositories/setRepositories");
export const setErrorWhileGettingRepositories = createAction<string | null>("repositories/setError");
export const setRepository = createAction<Repository>("repositories/setRepository");
export const setErrorWhileGettingRepository = createAction<string | null>("repositories/setErrorWhileGettingRepository");


export const initialStateForRepositories: DataState<Repository[]> = {
    loading: false,
    error: null,
    data: []
}

const initialStateForSingleRepository: DataState<Repository> = {
    loading: false,
    error: null,
    data: null
}

export const subscribeToRepositories = createAsyncThunk(
    "repositories/subsribeToRepositories",
    async (accountId: number, { dispatch }) => {
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

export const subscribeToRepository = createAsyncThunk(
    "repositories/subscribeToRepository",
    async (repositoryId: string, { dispatch }) => {
        FirestoreService.listenToDocument<Repository>(
            `repositories/${repositoryId}`,
            (repository) => {
                dispatch(setRepository(repository));
            },
            (error) => {
                dispatch(setErrorWhileGettingRepository(error.message));
            }
        );
    }
);


export const repositoriesSlice = createSlice({
    name: "repositories",
    initialState: initialStateForRepositories,
    reducers: {},
    extraReducers: (builder: any) => {
        builder
        .addCase(setRepositories, (state: DataState<Repository>, action: any) => {
            state.data = action.payload;
            state.loading = false;
            state.error = null;
        })
        .addCase(setErrorWhileGettingRepositories, (state: DataState<Repository>, action: any) => {
            state.error = action.payload;
            state.loading = false;
        })
    }
})

export const repositorySlice = createSlice({
    name: "repository",
    initialState: initialStateForSingleRepository,
    reducers: {},
    extraReducers: (builder: any) => {
        builder
        .addCase(setRepository, (state: DataState<Repository>, action: any) => {
            state.data = action.payload;
            state.loading = false;
            state.error = null;
        })
        .addCase(setErrorWhileGettingRepository, (state: DataState<Repository>, action: any) => {
            state.error = action.payload;
            state.loading = false;
        })
    }
})