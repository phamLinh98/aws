import { configureStore } from "@reduxjs/toolkit";
import uploadReduxReducer from '../redux/uploadRedux'; // Consistent name
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

const store = configureStore({
    reducer: {
        upload: uploadReduxReducer, // Consistent name, better key name
    },
});

// Định nghĩa các kiểu RootState và AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Tạo các hook typed useSelector và useDispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;


export default store;