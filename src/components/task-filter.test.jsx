import { render, screen, fireEvent } from '@testing-library/react' // (or /dom, /vue, ...)
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { Provider } from 'react-redux';
import { configureTestStorePreloaded } from '../features/test-store'

import TaskFilter from './task-filter'

const store = configureTestStorePreloaded({ user:{ id: 12 }})

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

  expect(store.getState().tasks.currentFilter.slot).toEqual('this_month this_week');  
})
