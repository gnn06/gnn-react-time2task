import { combineReducers, configureStore } from '@reduxjs/toolkit';

import taskReducer, { taskSlice } from '../features/taskSlice';
import { apiSlice } from '../features/apiSlice';
import { createFilterConfListener } from './filterConfListener';
import { localRetrieveUser, localRetrieveAccessToken } from '../services/browser-storage';

const rootReducer = combineReducers({
  tasks: taskReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
    .prepend(createFilterConfListener().middleware)
    .concat(apiSlice.middleware),
  preloadedState: {
    tasks: {
      ...taskSlice.getInitialState(),
      user: localRetrieveUser(),
      accessToken: localRetrieveAccessToken(),
    }
  }
})
export default store;
