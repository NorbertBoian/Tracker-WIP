import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { apiSlice } from "./slices/apiSlice";
import { applicationSettingsSlice } from "./slices/applicationSettingsSlice";
import { mainSlice } from "./slices/mainSlice/mainSlice";
import { monthSettingsSlice } from "./slices/monthSettingsSlice";

export const store = configureStore({
  reducer: {
    applicationSettings: applicationSettingsSlice.reducer,
    main: mainSlice.reducer,
    monthSettings: monthSettingsSlice.reducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
