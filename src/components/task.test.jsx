import { render, screen } from '@testing-library/react' // (or /dom, /vue, ...)
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import userEvent from '@testing-library/user-event'

import Task from './task'

const mockStore = configureStore([]);
const store = mockStore({
    tasks: { user: { id: 12},
        selectedTaskId: []
    },
});

const task = { title: 'goiwashere', slotExpr: '', order: 123 }

test('order null', async () => {
   
  const mockApi = jest.fn();

  render(<Provider store={store}><table><tbody><Task task={task} api={mockApi}/></tbody></table></Provider>)

  const input = screen.getByPlaceholderText('Ordre')
  
  // await userEvent.type(input, '{Control}{a}')
  // await userEvent.type(input, '{Delete}')
  await userEvent.type(input, '{Backspace}{Backspace}{Backspace}{Tab}')

  expect(mockApi).toHaveBeenCalledWith({order: null});

})