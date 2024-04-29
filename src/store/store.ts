import { configureStore } from "@reduxjs/toolkit";
import {repositorySlice, repositoriesSlice} from "./repositories-slice";
import { activeAccountSlice, organisationSlice, userAccountSlice, userOrganisationsSlice } from "./account-slice";

export interface DataState<T> {
    loading: boolean;
    error: string | null;
    data: T | null;
}

export const store = configureStore({
    reducer: {
        repositories: repositoriesSlice.reducer,
        repository: repositorySlice.reducer,
        userAccount: userAccountSlice.reducer,
        organisation: organisationSlice.reducer,
        userOrganisations: userOrganisationsSlice.reducer,
        activeAccount: activeAccountSlice.reducer
    }
})

export type RootState = ReturnType<typeof store.getState>