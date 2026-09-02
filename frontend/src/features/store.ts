import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import systemReducer from './systemSlice';
import { authReducer } from './auth';
import { toolsReducer } from './tools';
import { adminReducer } from './admin';
import { notificationsReducer } from './notifications';

export const store = configureStore({
  reducer: {
    system: systemReducer,
    auth: authReducer,
    tools: toolsReducer,
    admin: adminReducer,
    notifications: notificationsReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
