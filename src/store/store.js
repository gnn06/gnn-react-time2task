import { configureStore } from '@reduxjs/toolkit';
import slotReducer from '../features/slotSlice';
import taskReducer from '../features/taskSlice';


export default configureStore({
  reducer: {
    slot: slotReducer,
    task: taskReducer
  }
})