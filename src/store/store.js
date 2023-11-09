import { configureStore } from '@reduxjs/toolkit';
import taskReducer, { setTasks } from '../features/taskSlice';
import { getAllTasksP } from '../services/base';
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

const persistConfig = {
  key: 'root',
  storage,
}

const persistedReducer = persistReducer(persistConfig, taskReducer)

export const store = configureStore({
  reducer: persistedReducer
})


export const persistor = persistStore(store)

// retrieve task from DB and set state when done
//getAllTasksP().then(result => store.dispatch(setTasks(result)))