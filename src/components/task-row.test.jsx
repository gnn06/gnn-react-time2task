import { vi } from 'vitest';
import { render, screen } from '@testing-library/react' // (or /dom, /vue, ...)
import userEvent from '@testing-library/user-event'

import { Provider } from 'react-redux';
import { configureTestStorePreloaded } from '../features/test-store'

import {http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';

import TaskRow from './task-row';

const handlers = [
  http.get(import.meta.env.VITE_API_URL + 'Tasks', () => {
    return HttpResponse.json(
        [{
          id: 1234,
          label: 'projet',
        }]
    )
  }),
  http.patch(import.meta.env.VITE_API_URL + 'Tasks', async ({ request, params }) => {
    const body = await request.json();
    
    // Enregistrer l'appel
    patchSpy(body);
    
    return HttpResponse.json({ success: true });
  })
];

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const store = configureTestStorePreloaded({ user:{ id: 12 }})
const patchSpy = vi.fn();

test('order null', async () => {
  const task = { title: 'goi', slotExpr: '', order: 123 }
  render(<Provider store={store}><table><tbody><TaskRow task={task} /></tbody></table></Provider>)

  const input = screen.getByPlaceholderText('Titre')
  
  // await userEvent.type(input, '{Control}{a}')
  // await userEvent.type(input, '{Delete}')
  await userEvent.type(input, '24{Tab}')

  expect(patchSpy).toHaveBeenCalledWith({Sujet: "goi24"});

})