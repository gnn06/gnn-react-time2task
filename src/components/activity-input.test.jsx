import { render, screen } from '@testing-library/react' // (or /dom, /vue, ...)
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event'

import { configureTestStorePreloaded } from '../features/test-store'
import { vi } from 'vitest';

import {http, HttpResponse} from 'msw'
import {setupServer} from 'msw/node'
import ActivityInput from './activity-input';

const handlers = [
  http.get(import.meta.env.VITE_API_URL + 'Activities', () => {
    return HttpResponse.json(
        [{
          id: 1234,
          label: 'projet',
        }]
    )
  }),
]

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const store = configureTestStorePreloaded({ user:{ id: 12 }})
const task = { id: 24, title: 'goiwashere', slotExpr: '', order: 123 }

test ('load activities and select', async () => {
   
    const mockApi = vi.fn();

    render(<Provider store={store}><ActivityInput task={task} saveHandler={mockApi}/></Provider>)

    // getBy = plantage si non trouvé, findBy = attendre
    let input = await screen.findByRole('combobox')

    await userEvent.type(input, 'projet{Enter}')
    await screen.findByText('projet')

    expect(mockApi).toHaveBeenCalledWith(1234)
})