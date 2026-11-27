import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SlotSelectDialog from './slot-select-dialog';
import { DEFAULT_CONF } from '../data/slot-view';

const noop = () => {};

const TODAY = 'this_month this_week today';
const TOMORROW = 'this_month this_week tomorrow';
const TODAY_MATIN = 'this_month this_week today matin';
const TODAY_APREM = 'this_month this_week today aprem';

function renderDialog(selectionExpr, onConfirm = noop) {
    render(
        <SlotSelectDialog
            selectionExpr={selectionExpr}
            conf={DEFAULT_CONF}
            onConfirm={onConfirm}
            onCancel={noop}
            title="test"
        />
    )
}

describe('SlotSelectDialog — dates des créneaux', () => {
    // this_week = lundi 2024-12-30 ; today = 2025-01-03
    const SNAP_DATES = [
        { slotid: 'this_month', date: '2025-01' },
        { slotid: 'this_week',  date: '2024-12-30' },
        { slotid: 'today',      date: '2025-01-03' },
    ]
    const slotEl = (path) => document.querySelector(`[data-slot-path="${path}"]`)

    test('chaque créneau de niveau mois, semaine ou jour affiche sa date réelle', () => {
        render(<SlotSelectDialog selectionExpr="" conf={DEFAULT_CONF} snapDates={SNAP_DATES} onConfirm={noop} onCancel={noop} title="test" />)
        expect(slotEl('this_month')).toHaveTextContent('2025-01')
        expect(slotEl('this_month this_week')).toHaveTextContent('2024-12-30')
        expect(slotEl('this_month this_week mardi')).toHaveTextContent('2024-12-31')
        expect(slotEl(TODAY)).toHaveTextContent('2025-01-03')
        expect(slotEl(TOMORROW)).toHaveTextContent('2025-01-04')
    })

    test('un jour de la semaine suivante (injecté par la sélection de la tâche) porte la date de SA semaine', () => {
        render(<SlotSelectDialog selectionExpr="next_week mardi" conf={DEFAULT_CONF} snapDates={SNAP_DATES} onConfirm={noop} onCancel={noop} title="test" />)
        expect(slotEl('this_month next_week mardi')).toHaveTextContent('2025-01-07')
    })

    test('le niveau heure n\'affiche aucune date', () => {
        render(<SlotSelectDialog selectionExpr="" conf={DEFAULT_CONF} snapDates={SNAP_DATES} onConfirm={noop} onCancel={noop} title="test" />)
        expect(slotEl(TODAY_MATIN)).not.toHaveTextContent(/\d{4}-\d{2}/)
    })
})

describe('SlotSelectDialog — today/tomorrow dans le picker', () => {

    test('today et tomorrow présents dans le picker', () => {
        renderDialog('')
        expect(document.querySelector(`[data-slot-path="${TODAY}"]`)).toBeInTheDocument()
        expect(document.querySelector(`[data-slot-path="${TOMORROW}"]`)).toBeInTheDocument()
    })

    test('today matin et today aprem présents', () => {
        renderDialog('')
        expect(document.querySelector(`[data-slot-path="${TODAY_MATIN}"]`)).toBeInTheDocument()
        expect(document.querySelector(`[data-slot-path="${TODAY_APREM}"]`)).toBeInTheDocument()
    })

    test('selectionExpr=today → today sélectionné (bg-blue-400), pas de doublon', () => {
        renderDialog('today')
        const todayNodes = document.querySelectorAll(`[data-slot-path="${TODAY}"]`)
        expect(todayNodes).toHaveLength(1)
        expect(todayNodes[0].className).toContain('bg-blue-400')
    })

    test('selectionExpr=today matin → today matin sélectionné, un seul nœud today', () => {
        renderDialog('today matin')
        expect(document.querySelectorAll(`[data-slot-path="${TODAY}"]`)).toHaveLength(1)
        const todayMatinNode = document.querySelector(`[data-slot-path="${TODAY_MATIN}"]`)
        expect(todayMatinNode.className).toContain('bg-blue-400')
    })

    test('selectionExpr=this_week → clic today → confirm raffine en "this_month this_week today"', async () => {
        const onConfirm = vi.fn()
        const user = userEvent.setup()
        renderDialog('this_week', onConfirm)

        await user.click(document.querySelector(`[data-slot-path="${TODAY}"]`))
        await user.click(screen.getByRole('button', { name: /confirm/i }))

        expect(onConfirm).toHaveBeenCalledWith(TODAY)
    })
})

describe('SlotSelectDialog — bouton répétition today/tomorrow vs weekday', () => {
    test('bouton répétition visible sur today, absent sur mardi', () => {
        renderDialog('mardi')
        const todayNode = document.querySelector(`[data-slot-path="${TODAY}"]`)
        const mardiNode = document.querySelector('[data-slot-path="this_month this_week mardi"]')
        expect(within(todayNode).queryByTestId('LoopIcon')).toBeInTheDocument()
        expect(within(mardiNode).queryByTestId('LoopIcon')).not.toBeInTheDocument()
    })
})
