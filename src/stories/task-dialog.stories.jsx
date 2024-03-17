import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';

import TaskDialog  from '../components/task-dialog';
import '../assets/index.css'

const task = {
    id: 12,
    title: 'titre',
    slotExpr: 'lundi mardi',
    order: 12,
    status: 'en cours'
};

export const MockedState = {
    tasks: [],
    status: 'idle',
    error: null,
    selectedTaskId: []
};
  
  
const Mockstore = ({ taskboxState, children }) => (
<Provider
    store={configureStore({
    reducer: {
        tasks: createSlice({
        name: 'tasks',
        initialState: taskboxState,
        reducers: {}
        }).reducer
    }
    })}
>
    {children}
</Provider>
);

export default {
    component: TaskDialog,
    excludeStories: /.*MockedState$/,
};
  
export const Default = {
    args: { task : task },
    decorators: [(story) => <Mockstore taskboxState={MockedState}><table><tr>{story()}</tr></table></Mockstore>],
  };