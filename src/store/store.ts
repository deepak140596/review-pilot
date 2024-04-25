import { configureStore } from "@reduxjs/toolkit";
import repositoriesSlice from "./repositories-slice";


export const store = configureStore({
    reducer: {
        repositories: repositoriesSlice,
    }
})