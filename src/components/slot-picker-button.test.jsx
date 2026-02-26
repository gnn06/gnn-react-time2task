import { vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Provider } from 'react-redux';
import { configureTestStorePreloaded } from '../features/test-store'

import SlotPickerButton from './slot-picker-button'

const store = configureTestStorePreloaded({ user:{ id: 12 }})

describe('SlotPickerButton', () => {
  const mockOnSlotChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders button with correct text', () => {
    render(<SlotPickerButton selectedSlotExpr="" onSlotChange={mockOnSlotChange} />)
    
    const button = screen.getByRole('button', { name: /créneau/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Créneau')
  })

  test('shows chip with slot expression when slot is selected', async () => {
    render(<SlotPickerButton selectedSlotExpr="this_month this_week mercredi" onSlotChange={mockOnSlotChange} />)
    
    const chip = screen.getByText('this_week mercredi')
    expect(chip).toBeInTheDocument()
  })

  test('opens popper when button is clicked', async () => {
    const user = userEvent.setup()
    render(<Provider store={store}><SlotPickerButton selectedSlotExpr="" onSlotChange={mockOnSlotChange} /></Provider>)
    
    const button = screen.getByRole('button', { name: /créneau/i })
    await user.click(button)
    
    // Vérifier que le Popper s'ouvre en cherchant un élément du SlotPicker
    expect(screen.getByText('this_month')).toBeInTheDocument()
    expect(screen.getByText('this_week')).toBeInTheDocument()
  })

  test('closes popper when clicking outside', async () => {
    const user = userEvent.setup()
    render(
      <Provider store={store}><div>
        <SlotPickerButton selectedSlotExpr="" onSlotChange={mockOnSlotChange} />
        <div data-testid="outside-element">Outside</div>
      </div></Provider>
    )
    
    const button = screen.getByRole('button', { name: /créneau/i })
    await user.click(button)
    
    // Vérifier que le Popper est ouvert
    expect(screen.getByText('this_month')).toBeInTheDocument()
    
    // Cliquer à l'extérieur
    await user.click(screen.getByTestId('outside-element'))
    
    // Le Popper devrait être fermé, donc plus de texte de SlotPicker
    expect(screen.queryByText('Ce mois-ci')).not.toBeInTheDocument()
  })

  test('calls onSlotChange when slot is selected in popper', async () => {
    const user = userEvent.setup()
    render(<Provider store={store}><SlotPickerButton selectedSlotExpr="" onSlotChange={mockOnSlotChange} /></Provider>)
    
    const button = screen.getByRole('button', { name: /créneau/i })
    await user.click(button)
    
    // Cliquer sur un slot dans le Popper
    const thisWeekSlot = screen.getByText('this_week')
    await user.click(thisWeekSlot)
    
    expect(mockOnSlotChange).toHaveBeenCalledWith('this_month this_week')
  })

  test('shows clear icon when slot is selected', () => {
    render(<SlotPickerButton selectedSlotExpr="this_month this_week mercredi" onSlotChange={mockOnSlotChange} />)
    
    // L'icône Clear devrait être présente
    const clearIcon = document.querySelector('svg[data-testid="ClearIcon"]')
    expect(clearIcon).toBeInTheDocument()
  })

  test('calls onSlotChange with null when clear icon is clicked', async () => {
    const user = userEvent.setup()
    render(<SlotPickerButton selectedSlotExpr="this_month this_week mercredi" onSlotChange={mockOnSlotChange} />)
    
    // Trouver et cliquer sur l'icône Clear
    const clearIcon = document.querySelector('svg[data-testid="ClearIcon"]')
    await user.click(clearIcon)
    
    expect(mockOnSlotChange).toHaveBeenCalledWith(null)
  })

  test('does not show clear icon when no slot is selected', () => {
    render(<SlotPickerButton selectedSlotExpr="" onSlotChange={mockOnSlotChange} />)
    
    // L'icône Clear ne devrait pas être présente
    const clearIcon = document.querySelector('svg[data-testid="ClearIcon"]')
    expect(clearIcon).not.toBeInTheDocument()
  })

  test('popper stays open when clicking on slot', async () => {
    const user = userEvent.setup()
    render(<Provider store={store}><SlotPickerButton selectedSlotExpr="" onSlotChange={mockOnSlotChange} /></Provider>)
    
    const button = screen.getByRole('button', { name: /créneau/i })
    await user.click(button)
    
    // Vérifier que le Popper est ouvert
    expect(screen.getByText('this_month')).toBeInTheDocument()
    
    // Cliquer sur un slot
    const thisWeekSlot = screen.getByText('this_week')
    await user.click(thisWeekSlot)
    
    // Le Popper devrait rester ouvert
    expect(screen.getByText('this_month')).toBeInTheDocument()
  })
})
