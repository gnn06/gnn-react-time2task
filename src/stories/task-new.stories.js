import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import '../assets/index.css'

import Component  from '../components/task-new';

const task = {
  id: 12,
  title: 'titre',
  slotExpr: 'lundi mardi',
  order: 12
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
  component: Component,
  excludeStories: /.*MockedState$/,
};

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Default = {
  args: { task : task},
  decorators: [(story) => <Mockstore taskboxState={MockedState}><table><tr>{story()}</tr></table></Mockstore>],
};