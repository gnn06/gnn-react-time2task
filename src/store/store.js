import { configureStore } from '@reduxjs/toolkit';
import taskReducer from '../features/taskSlice';
import { apiSlice } from '../features/apiSlice';

const store = configureStore({
  reducer: {
    tasks: taskReducer,
    [apiSlice.reducerPath]: apiSlice.reducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(apiSlice.middleware)
})
export default store;
//export const persistor = persistStore(store)
