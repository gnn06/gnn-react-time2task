// To avoid "An unhandled error occurred processing a request for the endpoint "getActivities"."

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Provider } from 'react-redux';
import { configureTestStorePreloaded } from '../features/test-store'
import { setFilterSlot } from '../features/taskSlice'

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

test('tâche complement (mardi) → icône fixe visible', () => {
    const task = { id: 1, title: 'test', slotExpr: 'this_week mardi' }
    render(<Provider store={store}><TaskInSlot task={task}/></Provider>)
    expect(screen.getByTestId('fixed-slot-icon')).toBeInTheDocument()
})

test('tâche today → pas d\'icône fixe', () => {
    const task = { id: 1, title: 'test', slotExpr: 'today' }
    render(<Provider store={store}><TaskInSlot task={task}/></Provider>)
    expect(screen.queryByTestId('fixed-slot-icon')).not.toBeInTheDocument()
})

test('tâche projetée (originalSlotExpr mardi) → icône fixe visible', () => {
    const task = { id: 1, title: 'test', slotExpr: 'today', originalSlotExpr: 'this_week mardi' }
    render(<Provider store={store}><TaskInSlot task={task}/></Provider>)
    expect(screen.getByTestId('fixed-slot-icon')).toBeInTheDocument()
})

test.each([
    ['chaque', 'chaque vendredi'],
    ['every 1', 'every 1 this_week mardi'],
    ['every 2', 'every 2 this_week mardi'],
])('tâche répétitive (%s) → icône répétition visible avec infobulle', (_, slotExpr) => {
    const task = { id: 1, title: 'test', slotExpr }
    render(<Provider store={store}><TaskInSlot task={task}/></Provider>)
    const icon = screen.getByTestId('repeat-slot-icon')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAccessibleName('tâche répétitive')
})

test('tâche non répétitive → pas d\'icône répétition', () => {
    const task = { id: 1, title: 'test', slotExpr: 'this_week mardi' }
    render(<Provider store={store}><TaskInSlot task={task}/></Provider>)
    expect(screen.queryByTestId('repeat-slot-icon')).not.toBeInTheDocument()
})

test('tâche projetée (originalSlotExpr chaque mardi) → icône répétition visible', () => {
    const task = { id: 1, title: 'test', slotExpr: 'today', originalSlotExpr: 'chaque mardi' }
    render(<Provider store={store}><TaskInSlot task={task}/></Provider>)
    expect(screen.getByTestId('repeat-slot-icon')).toBeInTheDocument()
})

describe('icône « aussi sur » — tâche multiple sous filtre créneau', () => {
    const renderWithFilter = (task, filterSlots = ['this_month this_week mardi']) => {
        const filterStore = configureTestStorePreloaded({ user: { id: 12 } })
        filterSlots.forEach(path => filterStore.dispatch(setFilterSlot(path)))
        render(<Provider store={filterStore}><TaskInSlot task={task}/></Provider>)
    }

    test('filtre sur mardi, tâche lundi+mardi → icône avec les autres créneaux en infobulle', () => {
        renderWithFilter({ id: 1, title: 'test', slotExpr: 'this_week lundi mardi' })
        const icon = screen.getByTestId('other-slots-icon')
        expect(icon).toBeInTheDocument()
        expect(icon).toHaveAccessibleName('aussi sur : this_month this_week lundi')
    })

    test('plusieurs autres créneaux → tous listés', () => {
        renderWithFilter({ id: 1, title: 'test', slotExpr: 'this_week lundi mardi jeudi' })
        expect(screen.getByTestId('other-slots-icon'))
            .toHaveAccessibleName('aussi sur : this_month this_week lundi, this_month this_week jeudi')
    })

    test('sans filtre créneau → pas d\'icône', () => {
        renderWithFilter({ id: 1, title: 'test', slotExpr: 'this_week lundi mardi' }, [])
        expect(screen.queryByTestId('other-slots-icon')).not.toBeInTheDocument()
    })

    test('tâche non multiple → pas d\'icône', () => {
        renderWithFilter({ id: 1, title: 'test', slotExpr: 'this_week mardi' })
        expect(screen.queryByTestId('other-slots-icon')).not.toBeInTheDocument()
    })

    test('tous les créneaux de la tâche sont dans le filtre → pas d\'icône', () => {
        renderWithFilter({ id: 1, title: 'test', slotExpr: 'this_week mardi matin mardi aprem' })
        expect(screen.queryByTestId('other-slots-icon')).not.toBeInTheDocument()
    })

    test('tâche projetée → autres créneaux calculés sur le créneau d\'origine', () => {
        renderWithFilter({ id: 1, title: 'test', slotExpr: 'today', originalSlotExpr: 'this_week lundi mardi' })
        expect(screen.getByTestId('other-slots-icon')).toBeInTheDocument()
    })
})

test('don\'t loose nextAction and url on favorite click', async () => {
    const task = { id: 12, title: 'goi', slotExpr: 'this_week', nextAction: 'do it', url: 'http://example.com', favorite: false };
    
    render(<Provider store={store}><TaskInSlot task={task}/></Provider>);

    const user = userEvent.setup();
    const favBtn = screen.getByRole('button', { name: /favorite/i });
    await user.click(favBtn);

    expect(patchSpy).toHaveBeenCalledWith({extra_props: {favorite: true, nextAction: 'do it', url: 'http://example.com' }});
});