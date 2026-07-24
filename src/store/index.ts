import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { authSlice } from "./slices/authSlice";
import { uiSlice } from "./slices/uiSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authSlice.reducer,
      ui: uiSlice.reducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });

type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
