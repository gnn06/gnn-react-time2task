import { render, screen } from '@testing-library/react' // (or /dom, /vue, ...)
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import userEvent from '@testing-library/user-event'

import TaskNew from './task-new'

const mockStore = configureStore([]);
const store = mockStore({
  tasks: { user: { id: 12}},
});

test ('all fields', async () => {
   
    const mockApi = jest.fn();

    render(<Provider store={store}><table><tbody><TaskNew api={mockApi}/></tbody></table></Provider>)

    let input = screen.getByPlaceholderText('Titre')
    
    await userEvent.type(input, 'goiwashere{Tab}mardi{Tab}123{Tab}Personnel{Tab}')

    input = screen.getByText('A faire')
    await userEvent.type(input, 'en cours{Tab}')

    const saveButton = screen.getByText('Save')

    await userEvent.type(saveButton, '{Enter}')

    expect(mockApi).toHaveBeenCalled();
    expect(mockApi).toHaveBeenCalledWith({title: 'goiwashere', slotExpr: 'mardi', order: 123, activity: 2, status: 'en cours', user: 12});

})

test('only title', async () => {
   
  const mockApi = jest.fn();

  render(<Provider store={store}><table><tbody><TaskNew api={mockApi}/></tbody></table></Provider>)

  const input = screen.getByPlaceholderText('Titre')
  
  await userEvent.type(input, 'goiwashere')

  const saveButton = screen.getByText('Save')

  await userEvent.type(saveButton, '{Enter}')

  expect(mockApi).toHaveBeenCalled();
  expect(mockApi).toHaveBeenCalledWith({title: 'goiwashere', slotExpr: '', order: null, activity: null, status: 'A faire', user: 12});

})

test('only title + tab', async () => {
   
  const mockApi = jest.fn();

  render(<Provider store={store}><table><tbody><TaskNew api={mockApi}/></tbody></table></Provider>)

  const input = screen.getByPlaceholderText('Titre')
  
  await userEvent.type(input, 'goiwashere{Tab}{Tab}{Tab}{Tab}')

  const saveButton = screen.getByText('Save')

  await userEvent.type(saveButton, '{Enter}')

  expect(mockApi).toHaveBeenCalledWith({title: 'goiwashere', slotExpr: '', order: null, activity: null, status: 'A faire', user: 12});

})