import { render, screen } from '@testing-library/react' // (or /dom, /vue, ...)
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event'

import TaskNew from './task-new'
import { configureTestStorePreloaded } from '../features/test-store'
import { vi } from 'vitest';

import {http, HttpResponse} from 'msw'
import {setupServer} from 'msw/node'


const handlers = [
  http.get(import.meta.env.VITE_API_URL + 'Activities', () => {
    return HttpResponse.json([{
      id: '1234',
      label: 'projet',
    }])
  }),
]

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const store = configureTestStorePreloaded({ user:{ id: 12 }})

test('all fields', async () => {
   
    const mockApi = vi.fn();

    render(<Provider store={store}><table><tbody><TaskNew api={mockApi}/></tbody></table></Provider>)

    // Wait activities loading
    await screen.findByText('Activité ...')

    let input = screen.getByPlaceholderText('Titre')
    
    await userEvent.type(input, 'goiwashere{Tab}{Tab}mardi{Tab}123{Tab}en cours{Tab}')

    // need no key on activity component :-o
    input = screen.getAllByRole('combobox')[0]
    await userEvent.type(input, 'projet{Enter}')
    
    const saveButton = screen.getByText('Save')

    await userEvent.type(saveButton, '{Enter}')

    // expect(mockApi).toHaveBeenCalled();
    expect(mockApi).toHaveBeenCalledWith({title: 'goiwashere', slotExpr: 'mardi', order: 123, activity: 1234, status: 'en cours', user: ''});

})

test('only title', async () => {
   
  const mockApi = vi.fn();

  render(<Provider store={store}><table><tbody><TaskNew api={mockApi}/></tbody></table></Provider>)

    // Wait activities loading
    await screen.findByText('Activité ...')

    const input = screen.getByPlaceholderText('Titre')
  
  await userEvent.type(input, 'goiwashere')

  const saveButton = screen.getByText('Save')

  await userEvent.type(saveButton, '{Enter}')

  expect(mockApi).toHaveBeenCalled();
  expect(mockApi).toHaveBeenCalledWith({title: 'goiwashere', activity: null, slotExpr: '', order: null, status: 'A faire', user: ""});

})

test('only title + tab', async () => {
   
  const mockApi = vi.fn();

  render(<Provider store={store}><table><tbody><TaskNew api={mockApi}/></tbody></table></Provider>)

    // Wait activities loading
    await screen.findByText('Activité ...')

    const input = screen.getByPlaceholderText('Titre')
  
  await userEvent.type(input, 'goiwashere{Tab}{Tab}{Tab}')

  const saveButton = screen.getByText('Save')

  await userEvent.type(saveButton, '{Enter}')

  expect(mockApi).toHaveBeenCalledWith({title: 'goiwashere', activity: null, slotExpr: '', order: null, status: 'A faire', user: ''});

})

test('order null', async () => {
   
  const mockApi = vi.fn();

  render(<Provider store={store}><table><tbody><TaskNew api={mockApi}/></tbody></table></Provider>)

    // Wait activities loading
    await screen.findByText('Activité ...')

    const input = screen.getByPlaceholderText('Titre')
  
  await userEvent.type(input, 'goiwashere')

  const saveButton = screen.getByText('Save')

  await userEvent.type(saveButton, '{Enter}')

  expect(mockApi).toHaveBeenCalled();
  expect(mockApi).toHaveBeenCalledWith({title: 'goiwashere',activity: null, slotExpr: '', order: null, status: 'A faire', user: ''});

})