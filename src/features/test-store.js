import { configureStore } from '@reduxjs/toolkit';
import taskReducer from '../features/taskSlice';
import { apiSlice } from '../features/apiSlice';

export function configureTestStorePreloaded(initialState) {
    const store = configureStore({
        reducer: {
          tasks: taskReducer,
          preloadedState: { tasks: initialState },
          [apiSlice.reducerPath]: apiSlice.reducer
        },
        middleware: getDefaultMiddleware =>
          getDefaultMiddleware().concat(apiSlice.middleware)
    })
    return store
}
