import { configureStore } from '@reduxjs/toolkit';
import taskReducer, { setTasks } from '../features/taskSlice';
import { getAllTasksP } from '../services/base';

const store = configureStore({
  reducer: {
    tasks: taskReducer
  }
})
export default store;
export const persistor = persistStore(store)
// retrieve task from DB and set state when done
getAllTasksP().then(result => store.dispatch(setTasks(result)))