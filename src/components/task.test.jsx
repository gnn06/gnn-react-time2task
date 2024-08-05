import { render, screen } from '@testing-library/react' // (or /dom, /vue, ...)
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux';

import { configureTestStorePreloaded } from '../features/test-store'

import Task from './task'
import { vi } from 'vitest';

const task = { title: 'goiwashere', slotExpr: '', order: 123 }

test('order null', async () => {
   
  const store = configureTestStorePreloaded({ user:{ id: 12 }})
  const mockApi = vi.fn();

  render(<Provider store={store}><table><tbody><Task task={task} api={mockApi}/></tbody></table></Provider>)

  const input = screen.getByPlaceholderText('Ordre')
  
  // await userEvent.type(input, '{Control}{a}')
  // await userEvent.type(input, '{Delete}')
  await userEvent.type(input, '{Backspace}{Backspace}{Backspace}{Tab}')

  expect(mockApi).toHaveBeenCalledWith({order: null});

})