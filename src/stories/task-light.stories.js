import TaskLight  from '../components/task-light';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../features/apiSlice';
import '../assets/index.css'


const task = {
  id: 12,
  title: 'titre',
  slotExpr: 'lundi mardi',
  status: 'en cours',
  order: 12
};

export const MockedState = {
  tasks: [],
  status: 'idle',
  error: null,
  selectedTaskId: [],
  currentTaskFilter: ''
};

const Mockstore = ({ taskboxState, children }) => (
  <Provider
    store={configureStore({
        reducer: {
            tasks: createSlice({
                name: 'tasks',
                initialState: taskboxState,
                reducers: {}
            }).reducer,
            [apiSlice.reducerPath]: apiSlice.reducer
        },
        middleware: getDefaultMiddleware => getDefaultMiddleware().concat(apiSlice.middleware)
    })}
  >
    {children}
  </Provider>
);

export default {
  component: TaskLight,
  excludeStories: /.*MockedState$/,
};

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Default = {
  args: { task },
  decorators: [(story) => <Mockstore taskboxState={MockedState}><table><tr>{story()}</tr></table></Mockstore>],
};