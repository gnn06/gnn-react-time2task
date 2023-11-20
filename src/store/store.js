import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import taskReducer, { setTasks } from '../features/taskSlice';
import { getAllTasksP } from '../services/base';
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
// retrieve task from DB and set state when done
getAllTasksP().then(result => store.dispatch(setTasks(result)))