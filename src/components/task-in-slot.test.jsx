import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Provider } from 'react-redux';
import { configureTestStorePreloaded } from '../features/test-store'

import {http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';

import TaskInSlot from "./task-in-slot";

const patchSpy = vi.fn();

const handlers = [
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

test('don\'t loose nextAction and url on favorite click', async () => {
    const task = { id: 12, title: 'goi', slotExpr: 'this_week', nextAction: 'do it', url: 'http://example.com', favorite: false };
    
    render(<Provider store={store}><TaskInSlot task={task}/></Provider>);

    const user = userEvent.setup();
    const favBtn = screen.getByRole('button', { name: /favorite/i });
    await user.click(favBtn);

    expect(patchSpy).toHaveBeenCalledWith({extra_props: {favorite: true, nextAction: 'do it', url: 'http://example.com' }});
});