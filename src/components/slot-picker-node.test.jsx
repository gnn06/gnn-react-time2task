import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import SlotPickerNode from './slot-picker-node'

// Mock de SlotPickerCard
vi.mock('./slot-picker-card', () => ({
  default: (props) => {
    return <div data-testid={`slot-card-${props.slot.id}`} data-slot-path={props.slot.path}>
        {props.slot.id}
      </div>
  }
}))

// Mock du composant SlotTitle
vi.mock('./slot-title', () => ({
  default: (props) => {
    return <div data-testid="slot-title">{props.slot.id}</div>
  }
}))


describe('SlotPickerNode', () => {
  const mockSlot = {
    id: 'mercredi',
    path: 'this_month this_week mercredi',
    inner: []
  }

  const mockSlotWithChildren = {
    id: 'this_week',
    path: 'this_month this_week',
    inner: [
      {
        id: 'mercredi',
        path: 'this_month this_week mercredi',
        inner: []
      },
      {
        id: 'jeudi',
        path: 'this_month this_week jeudi',
        inner: []
      }
    ]
  }

  const mockOnSlotChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders single slot node', () => {
    render(<SlotPickerNode slot={mockSlot} selectedSlotExpr="" onSlotChange={mockOnSlotChange} />)
    
    expect(screen.getByTestId('slot-card-mercredi')).toBeInTheDocument()
    expect(screen.getByTestId('slot-card-mercredi')).toHaveAttribute('data-slot-path', 'this_month this_week mercredi')
  })

  test('renders slot node with children', () => {
    render(<SlotPickerNode slot={mockSlotWithChildren} selectedSlotExpr="" onSlotChange={mockOnSlotChange} />)
    
    // Vérifier le slot parent
    expect(screen.getByTestId('slot-card-this_week')).toBeInTheDocument()
    
    // Vérifier les slots enfants
    expect(screen.getByTestId('slot-card-mercredi')).toBeInTheDocument()
    expect(screen.getByTestId('slot-card-jeudi')).toBeInTheDocument()
  })

  test('passes correct props to SlotPickerCard', () => {
    render(<SlotPickerNode slot={mockSlot} selectedSlotExpr="test-slot" onSlotChange={mockOnSlotChange} />)
    
    const slotCard = screen.getByTestId('slot-card-mercredi')
    expect(slotCard).toBeInTheDocument()
  })

  test('applies correct CSS classes for container', () => {
    const { container } = render(<SlotPickerNode slot={mockSlot} selectedSlotExpr="" onSlotChange={mockOnSlotChange} />)
    
    const nodeContainer = container.querySelector('div > div')
    expect(nodeContainer).toBeInTheDocument()
  })

  test('applies special CSS classes for this_week level', () => {
    render(<SlotPickerNode slot={mockSlotWithChildren} selectedSlotExpr="" onSlotChange={mockOnSlotChange} />)
    
    // Le conteneur des enfants de this_week devrait avoir les classes flex
    const innerContainer = screen.getByTestId('slot-card-this_week').nextElementSibling
    expect(innerContainer).toHaveClass('ml-3', 'flex', 'flex-row')
  })

  test('applies default CSS classes for other levels', () => {
    render(<SlotPickerNode slot={mockSlot} selectedSlotExpr="" onSlotChange={mockOnSlotChange} />)
    
    // Le conteneur des enfants d'autres niveaux ne devrait avoir que ml-3
    const innerContainer = screen.getByTestId('slot-card-mercredi').nextElementSibling
    expect(innerContainer).toHaveClass('ml-3')
    expect(innerContainer).not.toHaveClass('flex', 'flex-row')
  })

  test('handles empty inner array', () => {
    render(<SlotPickerNode slot={mockSlot} selectedSlotExpr="" onSlotChange={mockOnSlotChange} />)
    
    const slotCard = screen.getByTestId('slot-card-mercredi')
    const innerContainer = slotCard.nextElementSibling
    
    // Le conteneur intérieur devrait exister mais être vide
    expect(innerContainer).toBeInTheDocument()
    expect(innerContainer.children).toHaveLength(0)
  })

  test('renders nested structure correctly', () => {
    const nestedSlot = {
      id: 'this_month',
      path: 'this_month',
      inner: [mockSlotWithChildren]
    }
    
    render(<SlotPickerNode slot={nestedSlot} selectedSlotExpr="" onSlotChange={mockOnSlotChange} />)
    
    // Vérifier la structure imbriquée
    expect(screen.getByTestId('slot-card-this_month')).toBeInTheDocument()
    expect(screen.getByTestId('slot-card-this_week')).toBeInTheDocument()
    expect(screen.getByTestId('slot-card-mercredi')).toBeInTheDocument()
    expect(screen.getByTestId('slot-card-jeudi')).toBeInTheDocument()
  })
})
