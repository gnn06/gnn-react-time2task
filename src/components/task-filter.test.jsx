// To avoid "An unhandled error occurred processing a request for the endpoint "getActivities"."

import { render, screen, fireEvent } from '@testing-library/react' // (or /dom, /vue, ...)
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { Provider } from 'react-redux';
import { configureTestStorePreloaded } from '../features/test-store'

import TaskFilter, { createFilterConfig } from './task-filter'

const store = configureTestStorePreloaded({ user:{ id: 12 }})

describe('createFilterConfig isRepeat', () => {
  const getRepeatFilter = () => createFilterConfig().find(f => f.key === 'isRepeat')

  test('expose un filtre isRepeat de type slotexpr', () => {
    const filter = getRepeatFilter()
    expect(filter).toBeDefined()
    expect(filter.type).toBe('slotexpr')
    expect(typeof filter.predicate).toBe('function')
  })

  test('predicate true pour une tâche avec au moins une répétition', () => {
    const filter = getRepeatFilter()
    expect(filter.predicate({ slotExpr: 'every 1 this_week mardi' })).toBeTruthy()
  })

  test('predicate false pour une tâche sans répétition', () => {
    const filter = getRepeatFilter()
    expect(filter.predicate({ slotExpr: 'mardi' })).toBeFalsy()
  })
})

test('bad filter, check error message', async () => {
  render(<Provider store={store}><TaskFilter /></Provider>)

  const input = screen.getByLabelText('Filtre :')

  await userEvent.type(input, 'mardi mercredi{Escape}{Enter}')
  // Need change application code that use deprecated keyCode to use {enter}
  //fireEvent.keyDown(input, { key: 'enter', code: 'Enter', keyCode: 13 })
  const error = screen.getByText('filter error')
  expect(error).toBeDefined()

  await userEvent.clear(input)
  fireEvent.keyDown(input, { key: 'enter', code: 'Enter', keyCode: 13 })
  expect(screen.queryByText('filter error')).toBeNull()
})

test('show Aide', async () => {
  render(<Provider store={store}><TaskFilter /></Provider>)

  await userEvent.click(screen.getByText('Aide'))
  const toto = screen.getByText('Aide Créneaux / Etats')
  expect(toto).toBeDefined();

  // fireEvent.click(screen.getByText('Aide'))
  // const toto = screen.getByText('Exemples de créneau')
  // expect(toto).toBeDefined();
})

test('SlotPickerButton renders and updates store', async () => {
  render(<Provider store={store}><TaskFilter /></Provider>)
  
  // Vérifier que le SlotPickerButton est présent
  const slotPickerButton = screen.getByRole('button', { name: /créneau/i })
  expect(slotPickerButton).toBeInTheDocument()
  
  // Ouvrir le Popper
  await userEvent.click(slotPickerButton)
  
  // Vérifier que le Popper s'ouvre
  expect(screen.getByText('this_month')).toBeInTheDocument()
  
  // Cliquer sur un slot
  const thisWeekSlot = screen.getByText('this_week')
  await userEvent.click(thisWeekSlot)

  expect(store.getState().tasks.currentFilter.slots).toEqual(['this_month this_week']);
})
