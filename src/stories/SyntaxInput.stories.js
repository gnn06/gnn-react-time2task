import Component  from '../components/syntax-input';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import '../assets/index.css'


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
  args: { items: [ 'à faire' ], placeHolderInput: 'placeholder', initialInputValue: 'chaque lundi matin chaque jeudi aprem', classNameInput: 'bg-green-200', onInputChange: null },
  decorators: [(story) => <Mockstore taskboxState={MockedState}><table class="w-1/3"><tr>{story()}</tr></table></Mockstore>],
};