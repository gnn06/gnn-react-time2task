import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import SlotPickerCard from './slot-picker-card'

// Mock du composant SlotTitle
vi.mock('./slot-title', () => ({
  default: (props) => {
    return <div data-testid="slot-title">{props.slot.id}</div>
  }
}))

describe('SlotPickerCard', () => {
  const mockSlot = {
    id: 'mercredi',
    path: 'this_month this_week mercredi',
    start: null,
    end: null
  }

  const mockOnSlotChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders slot card with correct content', () => {
    render(<SlotPickerCard slot={mockSlot} selectedSlotExpr="" onSlotChange={mockOnSlotChange} />)

    expect(screen.getByTestId('slot-title')).toHaveTextContent('mercredi')
  })

  describe('state management', () => {
    test('calls onSlotChange when clicked', async () => {
      const user = userEvent.setup()
      render(<SlotPickerCard slot={mockSlot} selectedSlotExpr="" onSlotChange={mockOnSlotChange} />)

      const card = screen.getByText('mercredi')
      await user.click(card)

      expect(mockOnSlotChange).toHaveBeenCalledWith('this_month this_week mercredi')
    })

    test('does not call onSlotChange when clicking already selected slot', async () => {
      const user = userEvent.setup()
      render(<SlotPickerCard slot={mockSlot} selectedSlotExpr="this_month this_week mercredi" onSlotChange={mockOnSlotChange} />)

      const card = screen.getByText('mercredi')
      await user.click(card)

      expect(mockOnSlotChange).not.toHaveBeenCalled()
    })
  })

  describe('styling', () => {
    test('applies selected style when slot is selected', () => {
      const { container } = render(<SlotPickerCard slot={mockSlot} selectedSlotExpr="this_month this_week mercredi" onSlotChange={mockOnSlotChange} />)
      expect(container.querySelector('.bg-blue-400')).toBeInTheDocument();
    })

    test('applies inside style when slot is inside selected path', () => {
      const { container } = render(<SlotPickerCard slot={mockSlot} selectedSlotExpr="this_month this_week mercredi matin" onSlotChange={mockOnSlotChange} />)
      expect(container.querySelector('.bg-blue-300')).toBeInTheDocument();
    })
  })

})
