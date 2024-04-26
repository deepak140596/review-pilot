import { configureStore } from "@reduxjs/toolkit";
import {repositorySlice, repositoriesSlice} from "./repositories-slice";

export interface DataState<T> {
    loading: boolean;
    error: string | null;
    data: T | null;
}

export const store = configureStore({
    reducer: {
        repositories: repositoriesSlice.reducer,
        repository: repositorySlice.reducer
    }
})

export type RootState = ReturnType<typeof store.getState>