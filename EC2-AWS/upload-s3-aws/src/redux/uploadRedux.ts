import { createSlice } from "@reduxjs/toolkit";

export const Upload = createSlice({
    name: "Comment",
    initialState: { listUpload: [], error: '', loading: false },
    reducers: {
        getUpload: (state:any, action:any) => {
            state.listUpload = [...state.listUpload, ...action.payload];
            state.loading = false;
        },
        logError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        eventLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
})

export const { getUpload, logError, eventLoading } = Upload.actions;
export default Upload.reducer;