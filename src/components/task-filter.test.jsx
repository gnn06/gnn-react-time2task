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

describe('createFilterConfig isNoRepeat', () => {
  const getNoRepeatFilter = () => createFilterConfig().find(f => f.key === 'isNoRepeat')

  test('expose un filtre isNoRepeat de type slotexpr', () => {
    const filter = getNoRepeatFilter()
    expect(filter).toBeDefined()
    expect(filter.type).toBe('slotexpr')
    expect(filter.valueLabels).toEqual({ true: 'aucune répétition' })
    expect(typeof filter.predicate).toBe('function')
  })

  test.each([
    ['créneau simple', 'mardi'],
    ['créneau précis sans répétition', 'this_week mardi'],
    ['plusieurs créneaux sans répétition', 'this_week mardi vendredi'],
  ])('predicate true pour une tâche non répétitive : %s', (_, slotExpr) => {
    expect(getNoRepeatFilter().predicate({ slotExpr })).toBe(true)
  })

  test.each([
    ['every 1', 'every 1 this_week mardi'],
    ['every 2 (répétition >= 2)', 'every 2 this_week mardi'],
    ['chaque', 'chaque vendredi'],
    ['id générique', 'week'],
    ['multi dont un seul créneau répétitif', 'this_week mardi chaque vendredi'],
  ])('predicate false pour une tâche répétitive : %s', (_, slotExpr) => {
    expect(getNoRepeatFilter().predicate({ slotExpr })).toBe(false)
  })

  test('isNoRepeat est le complément de isRepeat', () => {
    const config = createFilterConfig()
    const isRepeat = config.find(f => f.key === 'isRepeat').predicate
    const isNoRepeat = config.find(f => f.key === 'isNoRepeat').predicate
    for (const slotExpr of ['mardi', 'every 1 this_week mardi', 'every 2 this_week mardi', 'chaque vendredi']) {
      expect(isNoRepeat({ slotExpr })).toBe(!isRepeat({ slotExpr }))
    }
  })
})

describe('createFilterConfig isWeekDay', () => {
  const getWeekDayFilter = () => createFilterConfig().find(f => f.key === 'isWeekDay')

  test('expose un filtre isWeekDay de type slotexpr', () => {
    const filter = getWeekDayFilter()
    expect(filter).toBeDefined()
    expect(filter.type).toBe('slotexpr')
    expect(typeof filter.predicate).toBe('function')
  })

  test('predicate true pour une tâche avec un weekday', () => {
    const filter = getWeekDayFilter()
    expect(filter.predicate({ slotExpr: 'this_week mardi' })).toBeTruthy()
  })

  test('predicate false pour une tâche sans weekday', () => {
    const filter = getWeekDayFilter()
    expect(filter.predicate({ slotExpr: 'today' })).toBeFalsy()
  })
})

describe('createFilterConfig isRelatifPresent', () => {
  const getRelatifPresentFilter = () => createFilterConfig().find(f => f.key === 'isRelatifPresent')

  test('expose un filtre isRelatifPresent de type slotexpr', () => {
    const filter = getRelatifPresentFilter()
    expect(filter).toBeDefined()
    expect(filter.type).toBe('slotexpr')
    expect(typeof filter.predicate).toBe('function')
  })

  test('predicate true pour un créneau sans jour précis (y compris heure et multi)', () => {
    const filter = getRelatifPresentFilter()
    expect(filter.predicate({ slotExpr: 'this_week' })).toBeTruthy()
    expect(filter.predicate({ slotExpr: 'today' })).toBeTruthy()
    expect(filter.predicate({ slotExpr: 'today aprem' })).toBeTruthy()
    expect(filter.predicate({ slotExpr: 'today jeudi' })).toBeTruthy()
  })

  test('predicate false quand tous les créneaux sont épinglés à un jour', () => {
    const filter = getRelatifPresentFilter()
    expect(filter.predicate({ slotExpr: 'this_week mercredi' })).toBeFalsy()
    expect(filter.predicate({ slotExpr: 'mercredi aprem' })).toBeFalsy()
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
