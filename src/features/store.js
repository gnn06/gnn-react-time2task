import { combineReducers, configureStore } from '@reduxjs/toolkit';

import taskReducer from '../features/taskSlice';
import { apiSlice } from '../features/apiSlice';

const rootReducer = combineReducers({
  tasks: taskReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,  
});

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
    .concat(apiSlice.middleware)
})
export default store;
